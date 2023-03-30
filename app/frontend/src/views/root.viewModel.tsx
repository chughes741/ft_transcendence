import { ViewModel } from "react-model-view-viewmodel";
import GamePage from "../pages/GamePage";
import ChatPage from "../pages/Chat/ChatPage";
import ProfilePage from "src/pages/profile/ProfilePage";

/**
 * Contains business logic of RootView
 * @class
 */
export class RootViewModel extends ViewModel {
  private _state = 0;

  public get state() {
    return this._state;
  }

  /**
   * 
   * @returns - Dynamic page content
   */
  public SelectDynamicContent = () => {
    switch (this._state) {
      case 0: {
        return <GamePage />;
      }
      case 1: {
        return <ChatPage />;
      }
      case 2: {
        return <ProfilePage />;
      }
      default: {
        return <div></div>;
      }
    }
  };

  /**
   * Increments page change and notifies watchers
   */
  public load(): void {
    this._state += 1;
    if (this._state === 3) this._state = 0;
    this.notifyPropertiesChanged("state");
  }
}
