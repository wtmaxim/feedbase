import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { Separator } from '@feedbase/ui/components/separator';
import { getWorkspaceModuleConfig } from '@/lib/api/module';
import { getWorkspaceTheme } from '@/lib/api/theme';
import { getCurrentUser } from '@/lib/api/user';
import { getWorkspaceBySlug } from '@/lib/api/workspace';
import Header from '@/components/layout/nav-bar';
import CustomThemeWrapper from '@/components/layout/theme-wrapper';
import { ThemeProvider as NextThemeProvider } from '@/components/theme-provider';

type Props = {
  children: React.ReactNode;
  params: { workspace: string };
};

// Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Get workspace
  const { data: workspace, error } = await getWorkspaceBySlug(params.workspace, 'server', true, false);

  // If workspace is undefined redirects to 404
  if (error?.status === 404 || !workspace) {
    notFound();
  }

  return {
    title: workspace.name,
    description: `Discover the latest updates, roadmaps, submit feedback, and explore more about ${workspace.name}.`,
    icons: workspace.icon,
    openGraph: {
      images: [
        {
          url: workspace.opengraph_image || '',
          width: 1200,
          height: 600,
          alt: workspace.name,
        },
      ],
    },
  };
}

const tabs = [
  {
    name: 'Feedback',
    link: '/feedback',
  },
  {
    name: 'Changelog',
    link: '/changelog',
  },
];

export default async function HubLayout({ children, params }: Props) {
  const headerList = headers();
  const pathname = headerList.get('x-pathname');
  const hostname = headerList.get('host');
  const currentTab = tabs.find((tab) => tab.link === `/${pathname!.split('/')[1]}`);

  if (!currentTab) {
    redirect('/feedback');
  }

  // Get workspace data
  const { data: workspace, error } = await getWorkspaceBySlug(params.workspace, 'server', true, false);

  if (error?.status === 404 || !workspace) {
    notFound();
  }

  // Get workspace config
  const { data: config } = await getWorkspaceModuleConfig(params.workspace, 'server', true, false);

  // Get workspace theme
  const { data: workspaceTheme } = await getWorkspaceTheme(params.workspace, 'server', true, false);

  if (!config || !workspaceTheme) {
    notFound();
  }

  // Check if custom domain is set and redirect to it
  if (workspace.custom_domain && workspace.custom_domain_verified && hostname !== workspace.custom_domain) {
    redirect(`https://${workspace.custom_domain}`);
  }

  // Check if any modules are disabled and remove them from the tabs
  if (!config.changelog_enabled) {
    tabs.splice(1, 1);
  }

  // Get current user
  const { data: user } = await getCurrentUser('server');

  return (
    // <CustomThemeWrapper >
    <NextThemeProvider
      attribute='class'
      defaultTheme={
        workspaceTheme.theme === 'custom' ? undefined : workspaceTheme.theme === 'light' ? 'light' : 'dark'
      }>
      {/* Header */}
      <div className='flex h-full w-full flex-col items-center pt-5'>
        {/* Header */}
        {/* <Header tabs={tabs} intialTab={currentTab} workspace={workspace} user={user} config={config} /> */}

        {/* Separator with max screen width */}
        <Separator className='bg-border/60' />

        {/* Main content */}
        <div className='flex h-full w-full flex-col items-start justify-start pt-10 lg:max-w-screen-xl'>
          {children}
        </div>
      </div>
    </NextThemeProvider>

    //    {/* Powered by */}
    // {/* TODO: Improve */}
    // {/* <div className='flex h-full w-full flex-col items-center justify-center gap-4 p-5 pb-9'>
    // <Button
    //       variant='secondary'
    //       size='sm'
    //       className={cn(
    //         'text-foreground/80  inline-flex items-center rounded-lg px-3 py-1 w-fit text-md hover:text-foreground',
    //       )}>
    //       Powered by Feedbase
    //   </Button>
    // </div> */}
    // </CustomThemeWrapper>
  );
}
