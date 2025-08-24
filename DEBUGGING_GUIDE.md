# Firebase Permission Issues - Debugging Guide

## Current Issues:
1. **Album invitations failing** - Users can't send invitations due to permission errors
2. **User registration not writing to Firestore** - New users aren't being saved properly

## Solutions Applied:

### 1. Updated Firestore Rules (`firestore.rules`)
```javascript
// Simplified rules that are more permissive and reliable
match /users/{userId} {
  allow read, write, create: if request.auth != null && request.auth.uid == userId;
}

match /albums/{albumId} {
  allow read: if request.auth != null && 
    (request.auth.uid in resource.data.members || 
     request.auth.uid == resource.data.createdBy);
  allow write: if request.auth != null && 
    (request.auth.uid in resource.data.admins || 
     request.auth.uid == resource.data.createdBy);
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.createdBy;
}

match /albumInvitations/{invitationId} {
  // Simplified - no complex admin checking during creation
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.inviterUid;
  // Other operations for inviter/invitee only
}
```

### 2. Enhanced Error Handling
- Added detailed logging to identify permission issues
- Better fallback mechanisms when Firestore operations fail
- Improved error messages for debugging

### 3. Code Changes
- Updated `InvitationService.inviteUserToAlbum()` with better error handling
- Enhanced `AuthService.createUserDocument()` with more robust error handling
- Added debug methods to test Firebase operations

## To Deploy Fixed Rules:
1. Ensure you're logged into Firebase CLI: `firebase login`
2. Deploy rules: `firebase deploy --only firestore:rules`
3. Or manually update rules in Firebase Console

## Testing:
1. Try registering a new user - check browser console for errors
2. Create an album as a registered user
3. Try sending an invitation from the album detail page
4. Check browser console for detailed debug logs

## Debug Methods:
The `InvitationService` now has debug methods you can call from the browser console:
- `debugFirebaseOperations(albumId)` - Tests album and invitation permissions
- `debugUserCreation()` - Tests user document creation

## Common Error Codes:
- `permission-denied` - Check Firestore rules and user authentication
- `unauthenticated` - User not properly signed in
- `unavailable` - Network or Firestore connection issues
