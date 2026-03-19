using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroLink.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Commentslikesandbookmarksentitytables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Connections_Users_UserID",
                table: "Connections");

            migrationBuilder.CreateIndex(
                name: "IX_Connections_ConnectionUserId",
                table: "Connections",
                column: "ConnectionUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Connections_Users_ConnectionUserId",
                table: "Connections",
                column: "ConnectionUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Connections_Users_UserID",
                table: "Connections",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Connections_Users_ConnectionUserId",
                table: "Connections");

            migrationBuilder.DropForeignKey(
                name: "FK_Connections_Users_UserID",
                table: "Connections");

            migrationBuilder.DropIndex(
                name: "IX_Connections_ConnectionUserId",
                table: "Connections");

            migrationBuilder.AddForeignKey(
                name: "FK_Connections_Users_UserID",
                table: "Connections",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
