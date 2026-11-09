import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).legal.$handle';
import {LegalDocument} from '~/components/LegalDocument';
import {LEGAL, type LegalHandle} from '~/content/legal';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data ? LEGAL[data.handle].title : ''} — Terribelle`},
];

export function loader({params}: Route.LoaderArgs) {
  const handle = params.handle as LegalHandle;
  if (!Object.hasOwn(LEGAL, handle)) throw new Response(null, {status: 404});
  return {handle};
}

export default function LegalPage() {
  const {handle} = useLoaderData<typeof loader>();
  return (
    <div className="page page--legal">
      <header className="page__head">
        <p className="eyebrow">Terribelle</p>
        <h1 className="display-md" lang="en">
          {LEGAL[handle].title}
        </h1>
      </header>
      <LegalDocument handle={handle} />
    </div>
  );
}
