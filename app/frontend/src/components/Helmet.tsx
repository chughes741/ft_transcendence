import { Helmet } from "react-helmet";
import { useRootViewModelContext } from "src/root.context";

/**
 * Helmet with dynamic page names
 *
 * @todo - Move to /components
 * @returns {JSX.Element} - Helmet with dynamic page names
 */
export function HelmetView(): JSX.Element {
  const { pageState } = useRootViewModelContext();

  return (
    <>
      <Helmet>
        <title>King Pong | {pageState}</title>
      </Helmet>
    </>
  );
}
