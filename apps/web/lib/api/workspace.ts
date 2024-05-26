import { withUserAuth, withWorkspaceAuth } from '@/lib/auth';
import { AnalyticsProps, TeamMemberProps, WorkspaceProps } from '@/lib/types';
import { isSlugValid } from '@/lib/utils';

// Get Workspace
export const getWorkspaceBySlug = withWorkspaceAuth<WorkspaceProps['Row']>(
  async (user, supabase, workspace, error) => {
    // If any errors, return error
    if (error) {
      return { data: null, error };
    }

    // Check if workspace exists
    if (!workspace) {
      return { data: null, error: { message: 'workspace not found.', status: 404 } };
    }

    // Return workspace
    return { data: workspace, error: null };
  }
);

// Create Workspace
export const createWorkspace = (data: WorkspaceProps['Insert'], cType: 'server' | 'route') =>
  withUserAuth<WorkspaceProps['Row']>(async (user, supabase, error) => {
    // If any errors, return error
    if (error) {
      return { data: null, error };
    }

    // Check if slug is valid
    if (!isSlugValid(data.slug)) {
      return { data: null, error: { message: 'slug is invalid.', status: 400 } };
    }

    // Create Workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspace')
      .insert({
        name: data.name,
        slug: data.slug,
      })
      .select();

    // Check for errors
    if (workspaceError) {
      return { data: null, error: { message: workspaceError.message, status: 500 } };
    }

    // Return workspace
    return { data: workspace[0], error: null };
  })(cType);

// Update Workspace by slug
export const updateWorkspaceBySlug = (
  slug: string,
  data: WorkspaceProps['Update'],
  cType: 'server' | 'route'
) =>
  withWorkspaceAuth<WorkspaceProps['Row']>(async (user, supabase, workspace, error) => {
    // If any errors, return error
    if (error) {
      return { data: null, error };
    }

    // Check if slug is valid
    if (data.slug && !isSlugValid(data.slug)) {
      return { data: null, error: { message: 'slug is invalid.', status: 400 } };
    }

    // Update workspace
    const { data: updatedWorkspace, error: updateError } = await supabase
      .from('workspace')
      .update({
        name: data.name,
        slug: data.slug,
      })
      .eq('id', workspace!.id)
      .select()
      .single();

    // Check for errors
    if (updateError) {
      return { data: null, error: { message: updateError.message, status: 500 } };
    }

    // Return updated workspace
    return { data: updatedWorkspace, error: null };
  })(slug, cType);

// Delete Workspace by slug
export const deleteWorkspaceBySlug = withWorkspaceAuth<WorkspaceProps['Row']>(
  async (user, supabase, workspace, error) => {
    // If any errors, return error
    if (error) {
      return { data: null, error };
    }

    // Delete workspace
    const { data: deletedWorkspace, error: deleteError } = await supabase
      .from('workspace')
      .delete()
      .eq('id', workspace!.id)
      .select()
      .single();

    // Check for errors
    if (deleteError) {
      return { data: null, error: { message: deleteError.message, status: 500 } };
    }

    // Return success
    return { data: deletedWorkspace, error: null };
  }
);

// Get all workspace members by slug
export const getWorkspaceMembers = withWorkspaceAuth<TeamMemberProps[]>(
  async (user, supabase, workspace, error) => {
    // If any errors, return error
    if (error) {
      return { data: null, error };
    }

    // Get all members for workspace
    const { data: members, error: membersError } = await supabase
      .from('workspace_member')
      .select('profile (*), created_at')
      .eq('workspace_id', workspace!.id);

    // Check for errors
    if (membersError) {
      return { data: null, error: { message: membersError.message, status: 500 } };
    }

    // Map members data and add joined_at field to each member
    const restructuredData = members.map((item) => {
      const profileData = item.profile;
      return {
        ...profileData,
        joined_at: item.created_at,
      };
    }) as TeamMemberProps[];

    // Return members
    return { data: restructuredData, error: null };
  }
);

// Get workspace analytics
export const getWorkspaceAnalytics = (
  slug: string,
  cType: 'server' | 'route',
  data?: { start: string; end: string }
) =>
  withWorkspaceAuth(async (user, supabase, workspace, error) => {
    // If any errors, return error
    if (error) {
      return { data: null, error };
    }

    // Check if tinybird variables are set
    if (!process.env.TINYBIRD_API_URL || !process.env.TINYBIRD_API_KEY) {
      return { data: null, error: { message: 'Tinybird variables not set.', status: 500 } };
    }

    // If no start or end, set default to 7 days ago and url encode (without Z at end)
    const startDate = data?.start
      ? data.start
      : encodeURIComponent(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).slice(0, -1);
    const endDate = data?.end
      ? data.end
      : encodeURIComponent(new Date(Date.now()).toISOString()).slice(0, -1);

    // Fetch timeseries from Tinybird
    const timeseries = await fetch(
      `${process.env.TINYBIRD_API_URL}/v0/pipes/timeseries.json?end=${endDate}&start=${startDate}&workspace=${workspace?.slug}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TINYBIRD_API_KEY}`,
        },
      }
    ).then((res) => res.json());

    // Check for errors
    if (timeseries.error) {
      return { data: null, error: { message: timeseries.error, status: 500 } };
    }

    // Fetch top feedback from Tinybird
    const topFeedback = (await fetch(
      `${process.env.TINYBIRD_API_URL}/v0/pipes/top_feedback.json?workspace=${workspace?.slug}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TINYBIRD_API_KEY}`,
        },
      }
    ).then((res) => res.json())) as { data: AnalyticsProps; error: string };

    // Check for errors
    if (topFeedback.error) {
      return { data: null, error: { message: topFeedback.error, status: 500 } };
    }

    // Fetch top changelogs from Tinybird
    const topChangelogs = (await fetch(
      `${process.env.TINYBIRD_API_URL}/v0/pipes/top_changelogs.json?workspace=${workspace?.slug}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TINYBIRD_API_KEY}`,
        },
      }
    ).then((res) => res.json())) as { data: AnalyticsProps; error: string };

    // Check for errors
    if (topChangelogs.error) {
      return { data: null, error: { message: topChangelogs.error, status: 500 } };
    }

    // Get all feedback for workspace
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select()
      .eq('workspace_id', workspace!.id);

    // Check for errors
    if (feedbackError) {
      return { data: null, error: { message: feedbackError.message, status: 500 } };
    }

    // Get all changelogs for workspace
    const { data: changelogs, error: changelogsError } = await supabase
      .from('changelog')
      .select()
      .eq('workspace_id', workspace!.id);

    // Check for errors
    if (changelogsError) {
      return { data: null, error: { message: changelogsError.message, status: 500 } };
    }

    // Restructure topFeedback data to show feedback title instead of id
    const restructuredTopFeedback = topFeedback.data
      .map((item) => {
        const feedbackData = feedback.find((feedback) => feedback.id === item.key);

        // Skip if no matching feedback id found
        if (!feedbackData) {
          return null;
        }

        return {
          ...item,
          key: feedbackData.title || item.key,
        };
      })
      .filter(Boolean); // Remove null values

    // Restructure topChangelogs data to show changelog title instead of id
    const restructuredTopChangelogs = topChangelogs.data.map((item) => {
      const changelogData = changelogs.find((changelog) => changelog.id === item.key);

      // Skip if no matching changelog id found
      if (!changelogData) {
        return null;
      }

      return {
        ...item,
        key: changelogData?.title || item.key,
      };
    });

    // Return analytics
    return {
      data: {
        timeseries: timeseries.data as AnalyticsProps,
        topFeedback: restructuredTopFeedback.filter(
          (feedback) => feedback && feedback.key !== '_root'
        ) as AnalyticsProps,
        topChangelogs: restructuredTopChangelogs.filter(
          (changelog) => changelog && changelog.key !== '_root'
        ) as AnalyticsProps,
      },
      error: null,
    };
  })(slug, cType);
