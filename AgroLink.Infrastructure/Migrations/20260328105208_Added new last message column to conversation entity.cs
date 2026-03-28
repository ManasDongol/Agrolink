using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroLink.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Addednewlastmessagecolumntoconversationentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LastMessage",
                table: "Conversations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastMessageTime",
                table: "Conversations",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastMessage",
                table: "Conversations");

            migrationBuilder.DropColumn(
                name: "LastMessageTime",
                table: "Conversations");
        }
    }
}
