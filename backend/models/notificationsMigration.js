const fixNotifications = async () => {
    const donors = await User.find({ role: "Donor" });
    
    for (const donor of donors) {
      const updatedNotifications = donor.notifications.map(notification => {
        // Extract school name from message if missing
        if (!notification.schoolName && notification.message) {
          const schoolMatch = notification.message.match(/to (.+?) has/);
          if (schoolMatch) {
            notification.schoolName = schoolMatch[1];
          }
        }
        
        // Set default type if missing
        if (!notification.type) {
          if (notification.message.includes("approved")) {
            notification.type = "approval";
          } else if (notification.message.includes("completed")) {
            notification.type = "completion";
          } else if (notification.message.includes("submitted")) {
            notification.type = "donation_submission";
          } else {
            notification.type = "newRequest";
          }
        }
        
        return notification;
      });
      
      donor.notifications = updatedNotifications;
      await donor.save();
    }
  };