import { RootModelType, useRootModel } from "./root.model";
import { RootViewModelContext } from "./root.context";
import { useCallback } from "react";
import { socket } from "./contexts/WebSocket.context";
import { DevError } from "./chat/chat.types";
import { handleSocketErrorResponse } from "./chat/lib/helperFunctions";

/**
 * Root view model type
 *
 * @interface RootViewModelType
 * @extends {RootModelType}
 */
export interface RootViewModelType extends RootModelType {
  doNothing: () => void;
  handlePickUsername: (username: string) => void;
}

/**
 * Root view model provider
 *
 * @param children - Children
 * @returns - Root view model provider
 */
export const RootViewModelProvider = ({ children }) => {
  const rootModel = useRootModel();

  const doNothing = useCallback(() => {
    console.log("Doing nothing");
  }, []);

  const handlePickUsername = (username: string) => {
    if (!username || username.length === 0) {
      return;
    }

    console.log("Picking username: ", username);
    socket.emit("pickUsername", username, (err: DevError | null) => {
      if (handleSocketErrorResponse(err)) {
        const error = `RoomList: Error picking username: ${
          (err as DevError).error
        }`;
        alert(error);
        console.error(error);
      }
      console.log("Username picked successfully");
    });
    // FIXME: move these calls back up inside the socket callback once "pickUsername" is implemented in the backend
    rootModel.self.username = username;
    rootModel.setConfirmationMessage(
      `Are you sure you want to pick the username ${username}?
      This action cannot be reverted`
    );
    rootModel.setShowConfirmationModal(true);
  };

  return (
    <RootViewModelContext.Provider
      value={{
        ...rootModel,
        doNothing,
        handlePickUsername
      }}
    >
      {children}
    </RootViewModelContext.Provider>
  );
};
