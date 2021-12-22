import { useRoutes } from 'hookrouter';
import { HomePage, Map, NotFoundPage, GantriesGraph } from './pages';

const routes = {
  '/': () => <HomePage />,
  '/vehicle': () => <Map />,
  '/gantry': () => <GantriesGraph />
};

const Route = () => {
  const routeResult = useRoutes(routes);

  return routeResult || <NotFoundPage />;
}

export default Route