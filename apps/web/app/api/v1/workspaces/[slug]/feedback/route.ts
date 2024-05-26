import { NextResponse } from 'next/server';
import { createFeedback, getAllWorkspaceFeedback } from '@/lib/api/feedback';
import { FeedbackWithUserInputProps } from '@/lib/types';

export const runtime = 'edge';

/*
    Create Feedback
    POST /api/v1/workspaces/[slug]/feedback
    {
        title: string;
        content: string;
        status: string;
        tags: [id, id, id]
    }
*/
export async function POST(req: Request, context: { params: { slug: string } }) {
  const { title, content, status, tags, user } = (await req.json()) as FeedbackWithUserInputProps;

  // Validate Request Body
  if (!title) {
    return NextResponse.json({ error: 'title is required when creating feedback.' }, { status: 400 });
  }

  const { data: feedback, error } = await createFeedback(
    context.params.slug,
    {
      title: title || '',
      content: content || '',
      status: status?.toLowerCase() as FeedbackWithUserInputProps['status'],
      workspace_id: 'dummy-id',
      user_id: 'dummy-id',
      tags: tags || [],
      user: user !== null ? user : undefined,
    },
    'route'
  );

  // If any errors thrown, return error
  if (error) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  // Return feedback
  return NextResponse.json(feedback, { status: 200 });
}

/*
    Get Workspace Feedback
    GET /api/v1/workspaces/[slug]/feedback
*/
export async function GET(req: Request, context: { params: { slug: string } }) {
  const { data: feedback, error } = await getAllWorkspaceFeedback(context.params.slug, 'route', false);

  // If any errors thrown, return error
  if (error) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  // Return feedback
  return NextResponse.json(feedback, { status: 200 });
}
