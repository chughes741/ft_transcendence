// import { RootModelType, useRootModel } from "./root.model";
// import { RootViewModelContext } from "./root.context";
//
// /**
//  * Root view model type
//  *
//  * @interface RootViewModelType
//  * @extends {RootModelType}
//  */
// export interface RootViewModelType extends RootModelType {
//   getSessionToken: () => void;
// }
//
// /**
//  * Root view model provider
//  *
//  * @param children - Children
//  * @returns - Root view model provider
//  */
// export const RootViewModelProvider = ({ children }) => {
//   const {
//     self,
//     setSelf,
//     pageState,
//     setPageState,
//     fullscreen,
//     setFullscreen,
//     sessionToken,
//     setSessionToken
//   } = useRootModel();
//
//   /**
//    * Redirect to 42Auth
//    */
//   const getSessionToken = () => {
//     console.log("get session token");
//   };
//
//   return (
//     <RootViewModelContext.Provider
//       value={{
//         self,
//         setSelf,
//         pageState,
//         setPageState,
//         fullscreen,
//         setFullscreen,
//         sessionToken,
//         setSessionToken,
//         getSessionToken
//       }}
//     >
//       {children}
//     </RootViewModelContext.Provider>
//   );
// };

import {PageState, RootModelType, useRootModel} from "./root.model";
import { RootViewModelContext } from "./root.context";
import { createBrowserHistory } from "history";
import {useEffect} from "react";

/**
 * Root view model type
 *
 * @interface RootViewModelType
 * @extends {RootModelType}
 */
export interface RootViewModelType extends RootModelType {
    getSessionToken: () => void;
 }



/**
 * Root view model provider
 *
 * @param children - Children
 * @returns - Root view model provider
 */
export const RootViewModelProvider = ({ children }) => {
    const {
        self,
        setSelf,
        pageState,
        setPageState,
        fullscreen,
        setFullscreen,
        sessionToken,
        setSessionToken,
    } = useRootModel();

    /**
     * Redirect to 42Auth
     */
    const getSessionToken = () => {
        console.log("get session token");
    };

    /**
     * Navigate to a new page
     * @param pageState The new page state
     */

    const history = createBrowserHistory();

    /*
    *   This useEffect() is there to handle the back and forward button
    *   it uses the history.listen hook to check the URL and set the PageState accordingly
    */
    useEffect(() => {
        const unlisten = history.listen(({ location: location, action: action }) => {
            console.log(action, location);
            switch (location.pathname) {
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
                    setPageState(PageState.Home);
                    break;
            }
        });
        return () => {
            unlisten();
        };
    }, [history]);

    /*
     *  This useEffect() is there to append a path in the URL everytime a component is rendered
     *  It starts by verifying what is the current PageState and then, if the pathname isn't
     *  already the one corresponding to that pageState, append the url with the appropriate path
     *
     */
    useEffect(() => {
        switch (pageState) {
            case PageState.Home:
                if (history.location.pathname !== "/") {
                    history.push("/");
                }
                break;
            case PageState.Game:
                if (history.location.pathname !== "/game") {
                    history.push("/game");
                }
                break;
            case PageState.Chat:
                if (history.location.pathname !== "/chat") {
                    history.push("/chat");
                }
                break;
            case PageState.Profile:
                if (history.location.pathname !== "/profile") {
                    history.push("/profile");
                }
                break;
            default:
                if (history.location.pathname !== "/") {
                    history.push("/");
                }
                break;
        }
    }, [pageState]);
    return (
        <RootViewModelContext.Provider
            value={{
                self,
                setSelf,
                pageState,
                setPageState,
                fullscreen,
                setFullscreen,
                sessionToken,
                setSessionToken,
                getSessionToken
            }}
        >
            {children}
        </RootViewModelContext.Provider>
    );
};

