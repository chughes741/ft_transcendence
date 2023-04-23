import React, { useEffect } from "react";
import { Action, BrowserHistory, Location } from "history";
import { Router } from "react-router-dom";
import { PageState } from "./root.model";
import { useRootViewModelContext } from "./root.context";

interface CustomRouterProps {
  basename?: string;
  children?: React.ReactNode;
  history: BrowserHistory;
}

interface CustomRouterState {
  action: Action;
  location: Location;
}

export const CustomBrowserRouter: React.FC<CustomRouterProps> = (
  props: CustomRouterProps
) => {
  const [state, setState] = React.useState<CustomRouterState>({
    action: props.history.action,
    location: props.history.location
  });
  const { pageState, setPageState } = useRootViewModelContext();

  useEffect(() => {
    const unlisten = props.history.listen(({ location: location }) => {
      switch (location.pathname) {
        case "/auth":
          setPageState(PageState.Auth);
          break;
        case "/qrcode":
          setPageState(PageState.QRCode);
          break;
        case "/":
          setPageState(PageState.Home);
          break;
        case "/game":
          setPageState(PageState.Game);
          break;
        case "/chat":
          setPageState(PageState.Chat);
          break;
        case "/profile":
          setPageState(PageState.Profile);
          break;
        default:
          break;
      }
    });
    return () => {
      unlisten();
    };
  }, [history]);

  useEffect(() => {
    switch (pageState) {
      case PageState.Auth:
        if (props.history.location.pathname !== "/auth") {
          props.history.push("/auth");
        }
        break;
      case PageState.QRCode:
        if (props.history.location.pathname !== "/qrcode") {
          props.history.push("/qrcode");
        }
        break;
      case PageState.Home:
        if (props.history.location.pathname !== "/") {
          props.history.push("/");
        }
        break;
      case PageState.Game:
        if (props.history.location.pathname !== "/game") {
          props.history.push("/game");
        }
        break;
      case PageState.Chat:
        if (props.history.location.pathname !== "/chat") {
          props.history.push("/chat");
        }
        break;
      case PageState.Profile:
        if (props.history.location.pathname !== "/profile") {
          props.history.push("/profile");
        }
        break;
      default:
        break;
    }
  }, [pageState]);

  React.useLayoutEffect(() => props.history.listen(setState), [props.history]);
  return (
    <Router
      basename={props.basename}
      children={props.children}
      location={state.location}
      navigationType={state.action}
      navigator={props.history}
    />
  );
};
