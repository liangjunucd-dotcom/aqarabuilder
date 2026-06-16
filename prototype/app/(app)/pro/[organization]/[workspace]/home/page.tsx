import ProHomePage from '../../../page';

export function generateStaticParams() {
  return [
    { organization: 'aqara', workspace: 'seven-mi' },
    { organization: 'aqara', workspace: 'personal' },
  ];
}

export default function Page() {
  return <ProHomePage />;
}
