using FinalYearProject.Repositories;
using FinalYearProject.DTOs;
using FinalYearProject.Models;

namespace FinalYearProject.Services
{
    public interface IAnalyticsService
    {
        Task<ClientAnalyticsDto> GetClientAnalyticsAsync(int clientId, AnalyticsFilterDto? filter = null);
    }

    public class AnalyticsService : IAnalyticsService
    {
        private readonly IClientRepository _clientRepo;
        private readonly IClinicalObservationRepository _observationRepo;
        private readonly ISymptomRepository _symptomRepo;
        private readonly IAppointmentRepository _appointmentRepo;
        private readonly ITreatmentRepository _treatmentRepo;
        private readonly IProgressRepository _progressRepo;

        public AnalyticsService(
            IClientRepository clientRepo,
            IClinicalObservationRepository observationRepo,
            ISymptomRepository symptomRepo,
            IAppointmentRepository appointmentRepo,
            ITreatmentRepository treatmentRepo,
            IProgressRepository progressRepo)
        {
            _clientRepo = clientRepo;
            _observationRepo = observationRepo;
            _symptomRepo = symptomRepo;
            _appointmentRepo = appointmentRepo;
            _treatmentRepo = treatmentRepo;
            _progressRepo = progressRepo;
        }

        public async Task<ClientAnalyticsDto> GetClientAnalyticsAsync(int clientId, AnalyticsFilterDto? filter = null)
        {
            var client = _clientRepo.GetById(clientId);
            if (client == null)
                throw new Exception("Client not found");

            var startDate = filter?.StartDate ?? DateTime.UtcNow.AddMonths(-6);
            var endDate = filter?.EndDate ?? DateTime.UtcNow;

            var analytics = new ClientAnalyticsDto
            {
                ClientId = clientId,
                ClientName = $"{client.FirstName} {client.LastName}".Trim(),
                AnalysisPeriodStart = startDate,
                AnalysisPeriodEnd = endDate
            };

            // Get all data
            var observations = _observationRepo.GetByClientId(clientId)
                .Where(o => o.ObservationDate >= startDate && o.ObservationDate <= endDate)
                .OrderBy(o => o.ObservationDate)
                .ToList();

            var symptoms = _symptomRepo.GetByClientId(clientId)
                .Where(s => s.DateReported >= startDate && s.DateReported <= endDate)
                .ToList();

            var appointments = _appointmentRepo.GetByClientId(clientId)
                .Where(a => a.AppointmentDate >= startDate && a.AppointmentDate <= endDate)
                .ToList();

            var treatments = await _treatmentRepo.GetByClientIdAsync(clientId);
            treatments = treatments.Where(t => t.StartDate >= startDate && t.StartDate <= endDate).ToList();

            var progressRecords = await _progressRepo.GetByClientIdAsync(clientId);
            progressRecords = progressRecords
                .Where(p => p.DateRecorded >= startDate && p.DateRecorded <= endDate)
                .ToList();

            // Build analytics
            analytics.ClinicalObservationTrends = BuildClinicalObservationTrends(observations);
            analytics.SymptomAnalytics = BuildSymptomAnalytics(symptoms);
            analytics.AppointmentAnalytics = BuildAppointmentAnalytics(appointments);
            analytics.TreatmentProgress = BuildTreatmentProgress(treatments.ToList(), progressRecords.ToList());
            analytics.HealthScore = CalculateHealthScore(observations, symptoms, appointments, treatments.ToList());

            return analytics;
        }

        private ClinicalObservationTrendsDto BuildClinicalObservationTrends(List<ClinicalObservation> observations)
        {
            var trends = new ClinicalObservationTrendsDto();

            if (!observations.Any())
                return trends;

            // Weight trend
            var weightObs = observations.Where(o => o.Weight.HasValue).ToList();
            trends.WeightTrend = weightObs.Select(o => new DataPointDto
            {
                Date = o.ObservationDate,
                Value = o.Weight!.Value
            }).ToList();

            if (weightObs.Any())
            {
                trends.WeightStats = new VitalStatisticsDto
                {
                    Current = weightObs.Last().Weight!.Value,
                    Average = weightObs.Average(o => o.Weight!.Value),
                    Min = weightObs.Min(o => o.Weight!.Value),
                    Max = weightObs.Max(o => o.Weight!.Value),
                    Change = weightObs.Count > 1 ? weightObs.Last().Weight!.Value - weightObs.First().Weight!.Value : 0,
                    Trend = CalculateTrend(weightObs.Select(o => o.Weight!.Value).ToList())
                };
            }

            // Heart Rate trend
            var heartRateObs = observations.Where(o => o.HeartRate.HasValue).ToList();
            trends.HeartRateTrend = heartRateObs.Select(o => new DataPointDto
            {
                Date = o.ObservationDate,
                Value = o.HeartRate!.Value
            }).ToList();

            if (heartRateObs.Any())
            {
                trends.HeartRateStats = new VitalStatisticsDto
                {
                    Current = heartRateObs.Last().HeartRate!.Value,
                    Average = heartRateObs.Average(o => o.HeartRate!.Value),
                    Min = heartRateObs.Min(o => o.HeartRate!.Value),
                    Max = heartRateObs.Max(o => o.HeartRate!.Value),
                    Change = heartRateObs.Count > 1 ? heartRateObs.Last().HeartRate!.Value - heartRateObs.First().HeartRate!.Value : 0,
                    Trend = CalculateTrend(heartRateObs.Select(o => (double)o.HeartRate!.Value).ToList())
                };
            }

            // Blood Pressure trends
            var bpObs = observations.Where(o => !string.IsNullOrEmpty(o.BloodPressure)).ToList();
            foreach (var obs in bpObs)
            {
                var bp = ParseBloodPressure(obs.BloodPressure);
                if (bp.systolic > 0)
                {
                    trends.BloodPressureSystolicTrend.Add(new DataPointDto
                    {
                        Date = obs.ObservationDate,
                        Value = bp.systolic
                    });
                }
                if (bp.diastolic > 0)
                {
                    trends.BloodPressureDiastolicTrend.Add(new DataPointDto
                    {
                        Date = obs.ObservationDate,
                        Value = bp.diastolic
                    });
                }
            }

            // BMI calculation
            var bmiObs = observations.Where(o => o.Weight.HasValue && o.Height.HasValue && o.Height.Value > 0).ToList();
            trends.BMITrend = bmiObs.Select(o => new DataPointDto
            {
                Date = o.ObservationDate,
                Value = Math.Round(o.Weight!.Value / Math.Pow(o.Height!.Value / 100, 2), 2)
            }).ToList();

            if (bmiObs.Any())
            {
                var currentBMI = bmiObs.Last().Weight!.Value / Math.Pow(bmiObs.Last().Height!.Value / 100, 2);
                var avgBMI = bmiObs.Average(o => o.Weight!.Value / Math.Pow(o.Height!.Value / 100, 2));
                
                trends.BMIStats = new VitalStatisticsDto
                {
                    Current = Math.Round(currentBMI, 2),
                    Average = Math.Round(avgBMI, 2),
                    Min = Math.Round(bmiObs.Min(o => o.Weight!.Value / Math.Pow(o.Height!.Value / 100, 2)), 2),
                    Max = Math.Round(bmiObs.Max(o => o.Weight!.Value / Math.Pow(o.Height!.Value / 100, 2)), 2),
                    Trend = CalculateTrend(bmiObs.Select(o => o.Weight!.Value / Math.Pow(o.Height!.Value / 100, 2)).ToList())
                };
            }

            return trends;
        }

        private SymptomAnalyticsDto BuildSymptomAnalytics(List<Symptom> symptoms)
        {
            var analytics = new SymptomAnalyticsDto
            {
                TotalSymptoms = symptoms.Count,
                ActiveSymptoms = symptoms.Count(s => s.IsActive),
                ResolvedSymptoms = symptoms.Count(s => !s.IsActive)
            };

            if (symptoms.Any())
            {
                analytics.ResolutionRate = symptoms.Count > 0
                    ? (double)analytics.ResolvedSymptoms / symptoms.Count * 100
                    : 0;

                var resolvedWithDates = symptoms
                    .Where(s => !s.IsActive && s.DateResolved.HasValue)
                    .ToList();

                if (resolvedWithDates.Any())
                {
                    analytics.AverageResolutionTimeInDays = resolvedWithDates
                        .Average(s => (s.DateResolved!.Value - s.DateReported).TotalDays);
                }

                // Symptom intensity trends
                var symptomGroups = symptoms.GroupBy(s => s.Name);
                foreach (var group in symptomGroups)
                {
                    analytics.SymptomIntensityTrends.Add(new SymptomTrendDto
                    {
                        SymptomName = group.Key,
                        Status = group.Any(s => s.IsActive) ? "Active" : "Resolved",
                        IntensityOverTime = group.Select(s => new DataPointDto
                        {
                            Date = s.DateReported,
                            Value = s.SeverityLevel,
                            Label = s.IsActive ? "Active" : "Resolved"
                        }).OrderBy(d => d.Date).ToList()
                    });
                }

                // Most common symptoms
                analytics.MostCommonSymptoms = symptoms
                    .GroupBy(s => s.Name)
                    .Select(g => new SymptomFrequencyDto
                    {
                        SymptomName = g.Key,
                        Occurrences = g.Count(),
                        AverageSeverity = g.Average(s => s.SeverityLevel)
                    })
                    .OrderByDescending(s => s.Occurrences)
                    .Take(10)
                    .ToList();
            }

            return analytics;
        }

        private AppointmentAnalyticsDto BuildAppointmentAnalytics(List<Appointment> appointments)
        {
            var analytics = new AppointmentAnalyticsDto
            {
                TotalAppointments = appointments.Count,
                CompletedAppointments = appointments.Count(a => a.Status == "Completed"),
                CancelledAppointments = appointments.Count(a => a.Status == "Cancelled"),
                MissedAppointments = appointments.Count(a => a.Status == "Missed")
            };

            if (appointments.Any())
            {
                analytics.AttendanceRate = appointments.Count > 0
                    ? (double)analytics.CompletedAppointments / appointments.Count * 100
                    : 0;

                // Appointment frequency by month
                var grouped = appointments.GroupBy(a => new { a.AppointmentDate.Year, a.AppointmentDate.Month });
                analytics.AppointmentFrequency = grouped.Select(g => new DataPointDto
                {
                    Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                    Value = g.Count(),
                    Label = $"{g.Key.Year}-{g.Key.Month:D2}"
                }).OrderBy(d => d.Date).ToList();

                // Average days between appointments
                var sortedAppointments = appointments.OrderBy(a => a.AppointmentDate).ToList();
                if (sortedAppointments.Count > 1)
                {
                    var intervals = new List<double>();
                    for (int i = 1; i < sortedAppointments.Count; i++)
                    {
                        intervals.Add((sortedAppointments[i].AppointmentDate - sortedAppointments[i - 1].AppointmentDate).TotalDays);
                    }
                    analytics.AverageDaysBetweenAppointments = intervals.Average();
                }

                // Next appointment
                analytics.NextScheduledAppointment = appointments
                    .Where(a => a.AppointmentDate > DateTime.UtcNow && a.Status != "Cancelled")
                    .OrderBy(a => a.AppointmentDate)
                    .FirstOrDefault()?.AppointmentDate;
            }

            return analytics;
        }

        private TreatmentProgressDto BuildTreatmentProgress(List<Treatment> treatments, List<Progress> progressRecords)
        {
            var progress = new TreatmentProgressDto
            {
                ActiveTreatments = treatments.Count(t => t.Status == "Active"),
                CompletedTreatments = treatments.Count(t => t.Status == "Completed")
            };

            if (treatments.Any())
            {
                progress.CompletionRate = treatments.Count > 0
                    ? (double)progress.CompletedTreatments / treatments.Count * 100
                    : 0;

                // Individual treatment progress
                foreach (var treatment in treatments)
                {
                    var treatmentProgress = progressRecords
                        .Where(p => p.TreatmentId == treatment.Id)
                        .OrderBy(p => p.DateRecorded)
                        .ToList();

                    var progressPercentage = CalculateTreatmentProgressPercentage(treatment, treatmentProgress);

                    progress.TreatmentProgressItems.Add(new TreatmentProgressItemDto
                    {
                        TreatmentId = treatment.Id,
                        TreatmentName = treatment.Title,
                        Status = treatment.Status,
                        ProgressPercentage = progressPercentage,
                        ProgressHistory = treatmentProgress.Select((p, index) => new DataPointDto
                        {
                            Date = p.DateRecorded,
                            Value = ((index + 1) / (double)treatmentProgress.Count) * 100,
                            Label = p.ProgressStatus
                        }).ToList()
                    });
                }
            }

            return progress;
        }

        private OverallHealthScoreDto CalculateHealthScore(
            List<ClinicalObservation> observations,
            List<Symptom> symptoms,
            List<Appointment> appointments,
            List<Treatment> treatments)
        {
            var score = new OverallHealthScoreDto();
            var factors = new List<HealthFactorDto>();

            // Vital signs factor (0-25 points)
            var vitalScore = CalculateVitalSignsScore(observations);
            factors.Add(new HealthFactorDto
            {
                Name = "Vital Signs",
                Score = vitalScore,
                Impact = vitalScore >= 20 ? "Positive" : vitalScore >= 15 ? "Neutral" : "Negative"
            });

            // Symptom management factor (0-25 points)
            var symptomScore = CalculateSymptomScore(symptoms);
            factors.Add(new HealthFactorDto
            {
                Name = "Symptom Management",
                Score = symptomScore,
                Impact = symptomScore >= 20 ? "Positive" : symptomScore >= 15 ? "Neutral" : "Negative"
            });

            // Appointment adherence factor (0-25 points)
            var appointmentScore = CalculateAppointmentScore(appointments);
            factors.Add(new HealthFactorDto
            {
                Name = "Appointment Adherence",
                Score = appointmentScore,
                Impact = appointmentScore >= 20 ? "Positive" : appointmentScore >= 15 ? "Neutral" : "Negative"
            });

            // Treatment compliance factor (0-25 points)
            var treatmentScore = CalculateTreatmentScore(treatments);
            factors.Add(new HealthFactorDto
            {
                Name = "Treatment Progress",
                Score = treatmentScore,
                Impact = treatmentScore >= 20 ? "Positive" : treatmentScore >= 15 ? "Neutral" : "Negative"
            });

            score.CurrentScore = vitalScore + symptomScore + appointmentScore + treatmentScore;
            score.Factors = factors;
            score.Trend = score.CurrentScore >= 75 ? "Improving" : score.CurrentScore >= 50 ? "Stable" : "Declining";

            return score;
        }

        // Helper methods
        private string CalculateTrend(List<double> values)
        {
            if (values.Count < 2) return "Stable";

            var recentAvg = values.Skip(Math.Max(0, values.Count - 3)).Average();
            var earlierAvg = values.Take(Math.Min(3, values.Count)).Average();

            var percentChange = Math.Abs((recentAvg - earlierAvg) / earlierAvg * 100);

            if (percentChange < 5) return "Stable";
            return recentAvg > earlierAvg ? "Increasing" : "Decreasing";
        }

        private (int systolic, int diastolic) ParseBloodPressure(string? bp)
        {
            if (string.IsNullOrEmpty(bp)) return (0, 0);

            var parts = bp.Split('/');
            if (parts.Length == 2 && int.TryParse(parts[0], out int sys) && int.TryParse(parts[1], out int dia))
            {
                return (sys, dia);
            }
            return (0, 0);
        }

        private int CalculateTreatmentProgressPercentage(Treatment treatment, List<Progress> progressRecords)
        {
            if (treatment.Status == "Completed") return 100;
            if (treatment.Status == "Cancelled") return 0;

            if (treatment.EndDate.HasValue)
            {
                var totalDays = (treatment.EndDate.Value - treatment.StartDate).TotalDays;
                var elapsedDays = (DateTime.UtcNow - treatment.StartDate).TotalDays;
                return (int)Math.Min(100, (elapsedDays / totalDays) * 100);
            }

            return progressRecords.Count * 10; // Simple heuristic
        }

        private int CalculateVitalSignsScore(List<ClinicalObservation> observations)
        {
            if (!observations.Any()) return 15;

            var recent = observations.OrderByDescending(o => o.ObservationDate).Take(3).ToList();
            int score = 25;

            // Check BMI if available
            var withBMI = recent.Where(o => o.Weight.HasValue && o.Height.HasValue && o.Height.Value > 0).ToList();
            if (withBMI.Any())
            {
                var avgBMI = withBMI.Average(o => o.Weight!.Value / Math.Pow(o.Height!.Value / 100, 2));
                if (avgBMI < 18.5 || avgBMI > 30) score -= 5;
            }

            // Check heart rate
            var withHR = recent.Where(o => o.HeartRate.HasValue).ToList();
            if (withHR.Any())
            {
                var avgHR = withHR.Average(o => o.HeartRate!.Value);
                if (avgHR < 60 || avgHR > 100) score -= 5;
            }

            return Math.Max(0, score);
        }

        private int CalculateSymptomScore(List<Symptom> symptoms)
        {
            if (!symptoms.Any()) return 25;

            var activeCount = symptoms.Count(s => s.IsActive);
            var resolvedCount = symptoms.Count(s => !s.IsActive);
            var avgSeverity = symptoms.Where(s => s.IsActive).Any()
                ? symptoms.Where(s => s.IsActive).Average(s => s.SeverityLevel)
                : 0;

            int score = 25;
            if (activeCount > 5) score -= 5;
            if (avgSeverity > 7) score -= 5;
            if (resolvedCount > activeCount) score += 5;

            return Math.Clamp(score, 0, 25);
        }

        private int CalculateAppointmentScore(List<Appointment> appointments)
        {
            if (!appointments.Any()) return 15;

            var completed = appointments.Count(a => a.Status == "Completed");
            var total = appointments.Count;
            var rate = (double)completed / total;

            return (int)(rate * 25);
        }

        private int CalculateTreatmentScore(List<Treatment> treatments)
        {
            if (!treatments.Any()) return 15;

            var active = treatments.Count(t => t.Status == "Active");
            var completed = treatments.Count(t => t.Status == "Completed");

            if (completed > 0 && active == 0) return 25;
            if (active > 0) return 20;
            return 15;
        }
    }
}