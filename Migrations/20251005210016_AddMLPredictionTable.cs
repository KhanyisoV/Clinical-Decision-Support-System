using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyApp.Migrations
{
    /// <inheritdoc />
    public partial class AddMLPredictionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MLPredictions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    PredictedDiagnosis = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ConfidenceScore = table.Column<double>(type: "float", nullable: false),
                    Symptoms = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AdditionalNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsReviewedByDoctor = table.Column<bool>(type: "bit", nullable: false),
                    ReviewedByDoctorId = table.Column<int>(type: "int", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DoctorFeedback = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DiagnosisId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MLPredictions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MLPredictions_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MLPredictions_Diagnoses_DiagnosisId",
                        column: x => x.DiagnosisId,
                        principalTable: "Diagnoses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MLPredictions_Doctors_ReviewedByDoctorId",
                        column: x => x.ReviewedByDoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_MLPredictions_ClientId",
                table: "MLPredictions",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_MLPredictions_DiagnosisId",
                table: "MLPredictions",
                column: "DiagnosisId");

            migrationBuilder.CreateIndex(
                name: "IX_MLPredictions_ReviewedByDoctorId",
                table: "MLPredictions",
                column: "ReviewedByDoctorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MLPredictions");
        }
    }
}
