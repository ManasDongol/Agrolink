namespace AgroLink.Infrastructure.repoDTO;

public class UserConversationDto
{
    public Guid Id { get; set; }             // Conversation ID
 //   public Guid User1Id { get; set; }        // Participant 1 ID
   // public Guid User2Id { get; set; }        // Participant 2 ID
   
   public Guid PartnerId { get; set; }

 //   public string User1Name { get; set; }    // Participant 1 name
   // public string User1Profile { get; set; } // Participant 1 profile picture

   public string PartnerName { get; set; }

   public string PartnerProfile { get; set; }
   // public string User2Name { get; set; }    
    //public string User2Profile { get; set; }

    public MessageDto? LastMessage { get; set; } // Optional: last message for preview
}