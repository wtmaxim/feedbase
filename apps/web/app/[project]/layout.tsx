import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { Separator } from 'ui/components/ui/separator';
import { getProjectBySlug } from '@/lib/api/projects';
import { getCurrentUser } from '@/lib/api/user';
import Header from '@/components/hub/nav-bar';

type Props = {
  children: React.ReactNode;
  params: { project: string };
};

// Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Get project
  const { data: project, error } = await getProjectBySlug(params.project, 'server', true, false);

  // If project is undefined redirects to 404
  if (error?.status === 404 || !project) {
    notFound();
  }

  return {
    title: project.name,
    description: `Discover the latest updates, roadmaps, submit feedback, and explore more about ${project.name}.`,
    themeColor: '#05060A',
    icons: project.icon,
    openGraph: {
      images: [
        {
          url: project.og_image || '',
          width: 1200,
          height: 600,
          alt: project.name,
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
  const currentTab = tabs.find((tab) => tab.link === `/${pathname!.split('/')[1]}`);

  if (!currentTab) {
    redirect('/feedback');
  }

  // Get project data
  const { data: project, error } = await getProjectBySlug(params.project, 'server', true, false);

  if (error?.status === 404 || !project) {
    notFound();
  }

  // Get current user
  const { data: user } = await getCurrentUser('server');

  return (
    <main className='bg-root flex min-h-screen min-w-full flex-col justify-between selection:bg-[#8F9EFF]/20 selection:text-[#8F9EFF]'>
      <div className='flex h-full w-full flex-col items-center pt-5'>
        {/* Header */}
        <Header tabs={tabs} intialTab={currentTab} project={project} user={user} />

        {/* Separator with max screen width */}
        <Separator className='bg-border/60' />

        {/* Main content */}
        <div className='flex h-full w-full flex-col items-start justify-start pt-10 lg:max-w-screen-xl'>
          {children}
        </div>
      </div>

      {/* Powered by */}
      {/* TODO: Improve */}
      {/* <div className='flex h-full w-full flex-col items-center justify-center gap-4 p-5 pb-9'>
      <Button
            variant='secondary'
            size='sm'
            className={cn(
              'text-foreground/80 font-light inline-flex items-center rounded-lg px-3 py-1 w-fit text-md hover:text-foreground',
            )}>
            Powered by Luminar
        </Button>
      </div> */}
    </main>
  );
}
