import React from "react";
import {
  Dialog,
  DialogTitle,
  Avatar,
  Badge,
  MenuItem,
  ListItemText,
  TextField
} from "@mui/material";
import Autocomplete from "@mui/lab/Autocomplete";
import { UserStatus } from "kingpong-lib";

export interface UserEntity {
  username: string;
  avatar: string;
  status: UserStatus;
}

interface InviteUsersToRoomProps {
  showModal: boolean;
  closeModal: () => void;
  availableUsers: UserEntity[];
  selectedUsers: UserEntity[];
  setSelectedUsers: (users: UserEntity[]) => void;
}

export const InviteUsersModal: React.FC<InviteUsersToRoomProps> = ({
  showModal,
  closeModal,
  availableUsers,
  selectedUsers,
  setSelectedUsers
}) => {
  if (!showModal) {
    return null;
  }
  return (
    <Dialog
      open={showModal}
      onClose={closeModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: "30%",
          overflowX: "hidden"
        }
      }}
    >
      <DialogTitle alignContent={"center"}>Invite Users</DialogTitle>
      <Autocomplete
        id="user-autocomplete"
        options={availableUsers}
        getOptionLabel={(option) => option.username}
        multiple
        value={selectedUsers}
        renderOption={(props, option) => (
          <MenuItem {...props}>
            <Badge
              color={
                option.status === 0
                  ? "primary"
                  : option.status === 1
                  ? "error"
                  : "warning"
              }
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right"
              }}
              overlap="circular"
              variant="dot"
            >
              <Avatar
                alt={option.username}
                src={`https://i.pravatar.cc/150?u=${option.username}`}
                sx={{ width: 40, height: 40, marginRight: 1 }}
              />
            </Badge>
            <ListItemText primary={option.username} />
          </MenuItem>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Users"
            variant="outlined"
            margin="normal"
            fullWidth
          />
        )}
        onChange={(event, values) => setSelectedUsers(values)}
      />
    </Dialog>
  );
};
// import React from "react";
// import {
//   Avatar,
//   Badge,
//   Dialog,
//   DialogTitle,
//   InputLabel,
//   ListItemText,
//   MenuItem,
//   Select
// } from "@mui/material";
// import { UserStatus } from "kingpong-lib";

// export interface UserEntity {
//   username: string;
//   avatar: string;
//   status: UserStatus;
// }

// interface InviteUsersToRoomProps {
//   showModal: boolean;
//   closeModal: () => void;
//   availableUsers: UserEntity[];
//   selectedUser: string;
//   setSelectedUser: (username: string) => void;
// }

// export const InviteUsersModal: React.FC<InviteUsersToRoomProps> = ({
//   showModal,
//   closeModal,
//   availableUsers,
//   selectedUser,
//   setSelectedUser
// }) => {
//   if (!showModal) {
//     return null;
//   }

//   return (
//     <Dialog
//       open={showModal}
//       onClose={closeModal}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         sx: {
//           width: "30%",
//           overflowX: "hidden"
//         }
//       }}
//     >
//       <DialogTitle alignContent={"center"}>Join Room</DialogTitle>
//       <InputLabel
//         defaultValue="User"
//         htmlFor="user-dropdown"
//       >
//         Select User
//       </InputLabel>
//       <Select
//         labelId="user-dropdown-label"
//         id="user-dropdown"
//         value={selectedUser}
//         label="User"
//         fullWidth
//         onChange={(e) => setSelectedUser(e.target.value)}
//       >
//         {availableUsers.map((user) => (
//           <MenuItem
//             key={user.username}
//             value={user.username}
//           >
//             <Badge
//               color={
//                 user.status === 0
//                   ? "primary"
//                   : user.status === 1
//                   ? "error"
//                   : "warning"
//               }
//               anchorOrigin={{
//                 vertical: "bottom",
//                 horizontal: "right"
//               }}
//               overlap="circular"
//               variant="dot"
//             >
//               <Avatar
//                 alt={user.username}
//                 src={`https://i.pravatar.cc/150?u=${user.username}`}
//                 sx={{ width: 40, height: 40, marginRight: 1 }}
//               />
//             </Badge>
//             <ListItemText primary={user.username} />
//           </MenuItem>
//         ))}
//       </Select>
//     </Dialog>
//   );
// };
