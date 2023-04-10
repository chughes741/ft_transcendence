import {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState, ReactNode
} from "react";
import { PageState } from "../views/root.model";

interface PageStateContextType {
  pageState: PageState;
  setPageState: Dispatch<SetStateAction<PageState>>;
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
  const [pageState, setPageState] = useState<PageState>(PageState.Home);

  return (
    <PageStateContext.Provider value={{ pageState, setPageState }}>
      {children}
    </PageStateContext.Provider>
  );
}
