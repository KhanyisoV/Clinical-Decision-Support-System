using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyApp.Migrations
{
    /// <inheritdoc />
    public partial class AddPredictionHistoryTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PredictionHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MLPredictionId = table.Column<int>(type: "int", nullable: false),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    PredictedDiagnosis = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ConfidenceScore = table.Column<double>(type: "float", nullable: false),
                    Symptoms = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ActualDiagnosisId = table.Column<int>(type: "int", nullable: true),
                    ActualDiagnosisName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    WasAccurate = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PredictedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewedByDoctorId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PredictionHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PredictionHistories_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PredictionHistories_Diagnoses_ActualDiagnosisId",
                        column: x => x.ActualDiagnosisId,
                        principalTable: "Diagnoses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PredictionHistories_Doctors_ReviewedByDoctorId",
                        column: x => x.ReviewedByDoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PredictionHistories_MLPredictions_MLPredictionId",
                        column: x => x.MLPredictionId,
                        principalTable: "MLPredictions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_PredictionHistories_ActualDiagnosisId",
                table: "PredictionHistories",
                column: "ActualDiagnosisId");

            migrationBuilder.CreateIndex(
                name: "IX_PredictionHistories_ClientId",
                table: "PredictionHistories",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_PredictionHistories_MLPredictionId",
                table: "PredictionHistories",
                column: "MLPredictionId");

            migrationBuilder.CreateIndex(
                name: "IX_PredictionHistories_ReviewedByDoctorId",
                table: "PredictionHistories",
                column: "ReviewedByDoctorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PredictionHistories");
        }
    }
}
