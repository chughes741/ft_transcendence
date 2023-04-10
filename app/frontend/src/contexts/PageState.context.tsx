import {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
  ReactNode
} from "react";
import { PageState } from "src/root.model";

interface PageStateContextType {
  pageState: PageState;
  setPageState: (newPageState: PageState, caller: string) => void;
  setPageStateValue: Dispatch<SetStateAction<PageState>>;
}

const PageStateContext = createContext<PageStateContextType | undefined>(
  undefined
);

export function usePageStateContext(): PageStateContextType {
  const context = useContext(PageStateContext);
  if (!context) {
    throw new Error(
      "usePageStateContext must be used within a PageStateProvider"
    );
  }
  return context;
}

export function PageStateProvider({
  children
}: {
  children: ReactNode;
}): JSX.Element {
  const [pageState, setPageStateValue] = useState<PageState>(PageState.Home);

  const setPageState = (newPageState: PageState, caller: string) => {
    console.log(`Setting page state to ${newPageState} from ${caller}`);
    setPageStateValue(newPageState);
  };

  return (
    <PageStateContext.Provider
      value={{ pageState, setPageState, setPageStateValue }}
    >
      {children}
    </PageStateContext.Provider>
  );
}
