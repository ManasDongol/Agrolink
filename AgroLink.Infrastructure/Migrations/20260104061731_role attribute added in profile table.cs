using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroLink.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class roleattributeaddedinprofiletable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PorfileBackground",
                table: "Profiles",
                newName: "Role");

            migrationBuilder.AddColumn<string>(
                name: "ProfileBackground",
                table: "Profiles",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfileBackground",
                table: "Profiles");

            migrationBuilder.RenameColumn(
                name: "Role",
                table: "Profiles",
                newName: "PorfileBackground");
        }
    }
}
