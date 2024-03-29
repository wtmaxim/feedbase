'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Editor } from '@tiptap/react';
import { Input } from '@ui/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/components/ui/popover';
import { Separator } from '@ui/components/ui/separator';
import { Toggle } from '@ui/components/ui/toggle';
import { cn } from '@ui/lib/utils';
import {
  BadgeCheck,
  CalendarClockIcon,
  Check,
  ChevronDown,
  ChevronsUpDownIcon,
  ChevronUp,
  Code2Icon,
  EyeOffIcon,
  Image,
  Info,
  LayoutGrid,
  LinkIcon,
  List,
  ListOrderedIcon,
  LucideBold,
  LucideItalic,
  MoreHorizontal,
  PinIcon,
  Trash2Icon,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import { Alert, AlertDescription, AlertTitle } from 'ui/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from 'ui/components/ui/avatar';
import { Button } from 'ui/components/ui/button';
import { Label } from 'ui/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from 'ui/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui/components/ui/tabs';
import { PROSE_CN } from '@/lib/constants';
import { FeedbackCommentWithUserProps, FeedbackWithUserProps } from '@/lib/types';
import { actionFetcher, fetcher } from '@/lib/utils';
import { Icons } from '@/components/shared/icons/icons-static';
import RichTextEditor from '@/components/shared/tiptap-editor';
import DefaultTooltip from '@/components/shared/tooltip';
import Comment from './comment';
import { StatusCombobox } from './status-combobox';
import { TagCombobox } from './tag-combobox';

export function FeedbackSheet({
  feedback,
  initialFeedback,
  children,
}: {
  feedback: FeedbackWithUserProps[];
  initialFeedback: FeedbackWithUserProps;
  children: React.ReactNode;
}) {
  const { mutate } = useSWRConfig();
  const { slug } = useParams<{ slug: string }>();
  const commentEditor = useRef<Editor | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [currentFeedback, setCurrentFeedback] = useState(initialFeedback);
  const [open, setOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');

  const { data: comments, isLoading: commentsLoading } = useSWR<FeedbackCommentWithUserProps[]>(
    currentFeedback.id && open ? `/api/v1/projects/${slug}/feedback/${currentFeedback.id}/comments` : null,
    fetcher
  );

  // Render comments recursively
  const renderComments = useCallback(
    (comments: FeedbackCommentWithUserProps[] | undefined) => {
      return comments?.map((comment: FeedbackCommentWithUserProps) => (
        <Comment commentData={comment} projectSlug={'x'} key={comment.id} id={comment.id}>
          {renderComments(comment.replies)}
        </Comment>
      ));
    },
    [comments]
  );

  // Navigate feedback
  const navigateFeedback = useCallback(
    (direction: 'next' | 'previous') => {
      const currentIndex = feedback.findIndex((f) => f.id === currentFeedback.id);
      if (direction === 'next') {
        setCurrentFeedback(feedback[currentIndex + 1]);
      } else {
        setCurrentFeedback(feedback[currentIndex - 1]);
      }
    },
    [feedback, currentFeedback]
  );

  // Random re-render state to keep the editor & toolbar buttons in sync
  commentEditor.current?.on('transaction', () => {
    setOpen((prev) => !prev);
  });

  const { trigger: postComment, isMutating: isPostingComment } = useSWRMutation(
    `/api/v1/projects/${slug}/feedback/${currentFeedback.id}/comments`,
    actionFetcher,
    {
      onSuccess: () => {
        commentEditor.current?.commands.clearContent();
        setCommentContent('');
      },
      onError: () => {
        toast.error('Failed to post comment');
      },
    }
  );

  const { trigger: upvoteFeedback } = useSWRMutation(
    `/api/v1/projects/${slug}/feedback/${currentFeedback.id}/upvotes`,
    actionFetcher,
    {
      onSuccess: () => {
        mutate(`/api/v1/projects/${slug}/feedback`);
      },
      onError: () => {
        toast.error(`Failed to ${currentFeedback.has_upvoted ? 'remove upvote' : 'upvote feedback'}`);
        setCurrentFeedback(feedback.find((f) => f.id === currentFeedback.id) || initialFeedback);
      },
      optimisticData: () => {
        setCurrentFeedback((prev) => ({
          ...prev,
          has_upvoted: !prev.has_upvoted,
          upvotes: prev.has_upvoted ? prev.upvotes - 1 : prev.upvotes + 1,
        }));
      },
    }
  );

  const { trigger: updateFeedback } = useSWRMutation(
    `/api/v1/projects/${slug}/feedback/${currentFeedback.id}`,
    actionFetcher,
    {
      onSuccess: () => {
        mutate(`/api/v1/projects/${slug}/feedback`);
      },
      onError: () => {
        toast.error('Failed to update feedback');
        setCurrentFeedback(feedback.find((f) => f.id === currentFeedback.id) || initialFeedback);
      },
    }
  );

  // Make sure to always set initial feedback if sheet is opened
  useEffect(() => {
    if (open) {
      setCurrentFeedback(initialFeedback);
    }
  }, [open]);

  // Format date in a readable format, e.g. 2 days ago or if too old, show the date
  const formatDate = (date: string) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 1) {
      return 'Today';
    } else if (days < 2) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return new Date(date).toDateString();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className='flex max-w-full flex-row items-start justify-between gap-0 p-0 sm:w-[calc(100vw-20px)] sm:max-w-full md:max-w-5xl'>
        <div className='flex h-full w-full flex-col'>
          {/* Header */}
          <div className='flex h-12 w-full shrink-0 flex-row items-center justify-between gap-2 border-b px-6'>
            <div className='flex items-center gap-2'>
              <Label>Feedback</Label>
              <Button
                size='icon'
                variant='ghost'
                className='text-muted-foreground hover:text-foreground h-6 w-6'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground select-none text-sm'>
                {feedback.findIndex((f) => f.id === currentFeedback.id) + 1}{' '}
                <span className='text-muted-foreground/60'>/ {feedback.length}</span>
              </span>
              <DefaultTooltip
                content={
                  feedback.findIndex((f) => f.id === currentFeedback.id) === 0
                    ? "You've reached the first post"
                    : 'Go to previous post'
                }>
                <Button
                  size='icon'
                  variant='outline'
                  className='text-muted-foreground hover:text-foreground h-6 w-6'
                  disabled={feedback.findIndex((f) => f.id === currentFeedback.id) === 0}
                  onClick={() => {
                    navigateFeedback('previous');
                  }}>
                  <ChevronUp className='h-4 w-4' />
                </Button>
              </DefaultTooltip>
              <DefaultTooltip
                content={
                  feedback.findIndex((f) => f.id === currentFeedback.id) === feedback.length - 1
                    ? "You've reached the last post"
                    : 'Go to next post'
                }>
                <Button
                  size='icon'
                  variant='outline'
                  disabled={feedback.findIndex((f) => f.id === currentFeedback.id) === feedback.length - 1}
                  className='text-muted-foreground hover:text-foreground h-6 w-6'
                  onClick={() => {
                    navigateFeedback('next');
                  }}>
                  <ChevronDown className='h-4 w-4' />
                </Button>
              </DefaultTooltip>
            </div>
          </div>

          {/* Post Content */}
          <div className='flex h-full w-full flex-col items-start gap-4 overflow-auto p-6'>
            <SheetHeader>
              <SheetTitle>{currentFeedback.title}</SheetTitle>
              <div
                className={cn('text-secondary-foreground text-sm ', PROSE_CN)}
                dangerouslySetInnerHTML={{ __html: currentFeedback.description }}
              />
            </SheetHeader>

            <div className='flex h-fit w-full flex-col items-center justify-end gap-1 rounded-md border p-3'>
              {/* Editable Comment div with placeholder */}
              <RichTextEditor
                content={commentContent}
                setContent={setCommentContent}
                className='h-full min-h-[50px] w-full min-w-full'
                parentClassName='w-full min-h-[50px] h-full'
                placeholder='Write your comment here...'
                editorRef={commentEditor}
              />

              {/* Bottom Row */}
              <div className='flex w-full flex-row items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='text-muted-foreground hover:text-foreground h-6 w-6'>
                    <Image className='h-4 w-4' />
                  </Button>
                  <Toggle
                    className='h-6 w-6'
                    pressed={commentEditor.current?.isActive('bold')}
                    onPressedChange={() => {
                      commentEditor.current?.chain().focus().toggleMark('bold').run();
                    }}>
                    <LucideBold className='h-4 w-4' />
                  </Toggle>
                  <Toggle
                    pressed={commentEditor.current?.isActive('italic')}
                    onPressedChange={() => {
                      commentEditor.current?.chain().focus().toggleMark('italic').run();
                    }}
                    className='h-6 w-6'>
                    <LucideItalic className='h-4 w-4' />
                  </Toggle>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => {
                      commentEditor.current?.commands.toggleBulletList();
                    }}
                    className='text-muted-foreground hover:text-foreground h-6 w-6'>
                    <List className='h-4 w-4' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => {
                      commentEditor.current?.commands.toggleOrderedList();
                    }}
                    className='text-muted-foreground hover:text-foreground h-6 w-6'>
                    <ListOrderedIcon className='h-4 w-4' />
                  </Button>
                  <Popover
                    onOpenChange={(open) => {
                      if (!open) {
                        setLinkInput('');
                      } else {
                        // Pre-fill link input if there is a link
                        const link = commentEditor.current?.getAttributes('link').href;

                        if (link) {
                          setLinkInput(link);
                        }
                      }
                    }}>
                    <PopoverTrigger asChild>
                      <Button
                        size='icon'
                        variant='ghost'
                        className='text-muted-foreground hover:text-foreground h-6 w-6'>
                        <LinkIcon className='h-4 w-4' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-56 p-1'>
                      <form
                        className='flex items-center gap-1'
                        onSubmit={(e) => {
                          e.preventDefault();

                          // If no link input, return
                          if (!linkInput) {
                            return;
                          }

                          commentEditor.current
                            ?.chain()
                            .focus()
                            .toggleLink({
                              href: linkInput.includes('http') ? linkInput : `https://${linkInput}`,
                            })
                            .run();
                        }}>
                        <Input
                          placeholder='Enter URL'
                          value={linkInput}
                          onChange={(e) => setLinkInput(e.target.value)}
                          className='h-6 w-full border-transparent bg-transparent px-1 text-xs focus-visible:ring-0 focus-visible:ring-transparent'
                        />
                        <div className='flex items-center justify-center gap-0.5'>
                          <Button
                            type='submit'
                            size='icon'
                            variant='ghost'
                            className='text-muted-foreground hover:text-foreground h-6 w-6 shrink-0'>
                            <Check className='h-4 w-4' />
                          </Button>
                          <Button
                            size='icon'
                            type='button'
                            variant='ghost'
                            className='text-muted-foreground hover:text-foreground h-6 w-6 shrink-0'
                            onClick={() => {
                              commentEditor.current?.chain().focus().unsetLink().run();
                            }}>
                            <Trash2Icon className='h-4 w-4' />
                          </Button>
                        </div>
                      </form>
                    </PopoverContent>
                  </Popover>

                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => {
                      commentEditor.current?.commands.toggleCodeBlock();
                    }}
                    className='text-muted-foreground hover:text-foreground h-6 w-6'>
                    <Code2Icon className='h-4 w-4' />
                  </Button>
                </div>

                {/* Submit Button */}
                <Button
                  variant='default'
                  size='sm'
                  // onClick={onPostComment}
                  disabled={
                    // disabled if content is 0 or its only html tags
                    commentContent.replace(/<[^>]*>?/gm, '').length === 0 || isPostingComment
                  }
                  onClick={() => {
                    postComment({ content: commentContent });
                  }}>
                  {isPostingComment ? <Icons.Spinner className='mr-2 h-3.5 w-3.5 animate-spin' /> : null}
                  Post comment
                </Button>
              </div>
            </div>

            {/* Comments / Activity */}
            <Tabs defaultValue='comments' className='w-full space-y-4'>
              <TabsList className='flex items-center justify-between'>
                <div className='flex gap-2.5'>
                  <TabsTrigger
                    value='comments'
                    className='data-[state=active]:border-foreground hover:border-muted-foreground border-b border-transparent p-1 px-0 transition-colors'>
                    <Button variant='ghost' size='sm' className='text-foreground px-1.5 hover:bg-transparent'>
                      Comments
                    </Button>
                  </TabsTrigger>
                  <TabsTrigger
                    value='activity'
                    className='data-[state=active]:border-foreground hover:border-muted-foreground border-b border-transparent p-1 px-0 transition-colors'>
                    <Button variant='ghost' size='sm' className='text-foreground px-1.5 hover:bg-transparent'>
                      Activity
                    </Button>
                  </TabsTrigger>
                </div>

                <Button size='sm' variant='outline' className='text-secondary-foreground'>
                  Top comments
                </Button>
              </TabsList>
              <TabsContent value='comments' className='flex w-full flex-col items-start justify-start gap-4'>
                {/* Loading State */}
                {!comments && commentsLoading && (
                  <div className='flex w-full flex-col items-center justify-center gap-1 pt-20'>
                    <Icons.Spinner className='text-muted-foreground h-[18px] w-[18px] animate-spin' />
                    <span className='text-secondary-foreground ml-2 text-sm'>Loading comments...</span>
                  </div>
                )}

                {/* Empty State */}
                {comments && comments.length === 0 && !commentsLoading && (
                  <Alert className='w-full'>
                    <Info className='stroke-secondary-foreground -mt-[2px] h-5 w-5' />
                    <AlertTitle>No comments yet</AlertTitle>
                    <AlertDescription>
                      Be the first to comment on this feedback. Your feedback is important to us.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Comments */}
                {comments && comments.length > 0 && !commentsLoading && renderComments(comments)}
              </TabsContent>
              <TabsContent value='activity'>
                {/* TODO */}
                Feedback Activity
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Post Details */}
        <div className='flex h-full min-w-[33%] flex-col items-center border-l'>
          {/* Manage Bar */}
          <div className='flex h-12 w-full flex-row items-center justify-between gap-2 border-b pl-6 pr-9'>
            <Label>Manage</Label>
            <div className='flex gap-2'>
              <DefaultTooltip content='Copy Public Link'>
                <Button
                  size='icon'
                  variant='ghost'
                  className='text-muted-foreground hover:text-foreground h-7 w-7'>
                  <LinkIcon className='h-4 w-4' />
                </Button>
              </DefaultTooltip>
              <DefaultTooltip content='Pin Post'>
                <Button
                  size='icon'
                  variant='ghost'
                  className='text-muted-foreground hover:text-foreground h-7 w-7'>
                  <PinIcon className='h-4 w-4' />
                </Button>
              </DefaultTooltip>
              <DefaultTooltip content='Make Private'>
                <Button
                  size='icon'
                  variant='ghost'
                  className='text-muted-foreground hover:text-foreground h-7 w-7'>
                  <EyeOffIcon className='h-4 w-4' />
                </Button>
              </DefaultTooltip>
            </div>

            <div />
          </div>

          <div className='flex w-full flex-col gap-2 p-6'>
            <div className='flex items-center justify-between'>
              <Label>Upvotes</Label>
              <div className='flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  className={cn(
                    'text-secondary-foreground gap-1 transition-all active:scale-95',
                    currentFeedback.has_upvoted && 'text-accent-foreground bg-accent'
                  )}
                  onClick={() => {
                    upvoteFeedback({});
                  }}>
                  <ChevronUp className='h-4 w-4' />
                  {currentFeedback.upvotes}
                </Button>

                <DefaultTooltip content='View upvoters'>
                  <Button variant='ghost' size='icon' className='text-secondary-foreground h-7 w-7' disabled>
                    <Users className='h-4 w-4' />
                  </Button>
                </DefaultTooltip>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <Label>Status</Label>
              <StatusCombobox
                initialStatus={currentFeedback.status}
                onStatusChange={(status) => {
                  setCurrentFeedback((prev) => ({ ...prev, status }));
                  updateFeedback({ status, method: 'PATCH' });
                }}
              />
            </div>

            <div className='flex items-center justify-between'>
              <Label>Tags</Label>
              <TagCombobox
                initialTags={currentFeedback.tags || []}
                onTagsChange={(tags) => {
                  updateFeedback({ tags, method: 'PATCH' });
                }}
              />
            </div>

            <div className='flex items-center justify-between'>
              <Label>Board</Label>
              <Button
                variant='ghost'
                size='sm'
                className='text-secondary-foreground w-1/2 justify-between'
                disabled>
                <div className='flex items-center gap-1.5'>
                  <LayoutGrid className='text-foreground/60 h-4 w-4' />
                  Board
                </div>
                <ChevronsUpDownIcon className='text-muted-foreground h-4 w-4' />
              </Button>
            </div>

            <div className='flex items-center justify-between'>
              <Label>ETA</Label>
              <Button
                variant='ghost'
                size='sm'
                className='text-secondary-foreground w-1/2 justify-between'
                disabled>
                <div className='flex items-center gap-1.5'>
                  <CalendarClockIcon className='text-foreground/60 h-4 w-4' />
                  ETA
                </div>
                <ChevronsUpDownIcon className='text-muted-foreground h-4 w-4' />
              </Button>
            </div>
          </div>

          <Separator orientation='horizontal' className='w-[calc(100%-40px)]' />

          <div className='flex w-full flex-col items-end gap-2 p-6'>
            <div className='flex w-full items-center justify-between'>
              <Label>Created At</Label>
              <span className='text-secondary-foreground text-sm'>
                {formatDate(currentFeedback.created_at)}
              </span>
            </div>

            <div className='flex w-full items-center justify-between'>
              <Label>Created By</Label>
              <div className='text-secondary-foreground flex items-center gap-2 text-sm'>
                <Avatar className='-ml-1 h-6 w-6 select-none overflow-visible border '>
                  <div className='h-full w-full overflow-hidden rounded-full'>
                    <AvatarImage
                      src={currentFeedback.user.avatar_url || ''}
                      alt={currentFeedback.user.full_name}
                    />
                    <AvatarFallback className='text-xs '>{currentFeedback.user.full_name[0]}</AvatarFallback>
                    {currentFeedback.user.isTeamMember ? (
                      <div className='bg-root absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full'>
                        <BadgeCheck className='fill-highlight stroke-root outline-root z-10 h-3.5 w-3.5 outline-2' />
                      </div>
                    ) : null}
                  </div>
                </Avatar>
                {currentFeedback.user.full_name}
              </div>
            </div>

            {/* <Button
              variant='ghost'
              size='sm'
              className='text-secondary-foreground mt-5 flex w-fit items-center gap-2'>
              View full profile
              <ChevronRight className='h-4 w-4' />
            </Button> */}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
