using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroLink.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class addedischeckedcolumntoprofile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "isChecked",
                table: "Profiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isChecked",
                table: "Profiles");
        }
    }
}
