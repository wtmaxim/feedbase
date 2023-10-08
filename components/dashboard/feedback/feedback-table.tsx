'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronUp } from 'lucide-react';
import { FeedbackTagProps, FeedbackWithUserProps } from '@/lib/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import FeedbackModal from '../modals/view-feedback-modal';
import { statusOptions } from './status-combobox';
import useCreateQueryString from '@/lib/hooks/use-create-query';

export default function FeedbackTable({
  fetchedFeedback,
  tags,
}: {
  fetchedFeedback: FeedbackWithUserProps[];
  tags: FeedbackTagProps['Row'][];
}) {
  const searchParams = useSearchParams();
  const createQueryString = useCreateQueryString(searchParams);
  const pathname = usePathname();
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState<FeedbackWithUserProps[]>(fetchedFeedback);

  // Query params
  const tag = searchParams.get('tags') || '';
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  // Filter feedback by query params if they exist
  const filteredFeedback = feedbackList.filter((feedback) => {
    // Filter by search
    if (search && !feedback.title.toLowerCase().includes(search.toLowerCase())) return false;

    // Filter by tag/tags, if tags are multiple then they are separated by comma
    if (tag && !tag.split(',').some((t) => feedback.tags?.some((ft) => ft.name.toLowerCase() === t)))
      return false;

    // Filter by status
    if (status && !feedback.status?.toLowerCase().includes(status.toLowerCase())) return false;
    return true;
  });

  // Calc date in format: 15 Aug
  const formatDate = (date: Date) => {
    const day = date.getDate().toString();
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    return `${day} ${month}`;
  };

  return (
    <div className='flex w-full flex-col overflow-y-auto'>
      {/* If filteredFeedback is empty */}
      {filteredFeedback.length === 0 && (
        <Card className=' flex w-full flex-col items-center justify-center p-10 sm:p-20'>
          <CardHeader className='items-center text-center '>
            <CardTitle className='text-2xl font-medium'>No feedback matches your search</CardTitle>
            <CardDescription className='font-light'>
              Try adjusting the filters or search term.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* If filteredFeedback is not empty */}
      {filteredFeedback.map((feedback) => (
        <div
          className='jusify-between group flex h-14 flex-row items-center border border-b-0 p-1 transition-all hover:bg-accent/30 [&:first-child]:rounded-t-md [&:last-child]:rounded-b-md [&:last-child]:border-b'
          key={feedback.id}>
          {/* Upvotes & Title */}
          <FeedbackModal
            tags={tags}
            feedbackList={feedbackList}
            setFeedbackList={setFeedbackList}
            key={feedback.id}
            feedback={feedbackList.find((fb) => fb.id === feedback.id) || feedback}>
            <div className='flex w-full min-w-0 cursor-pointer flex-row  items-center'>
              {/* Upvotes */}
              <Button
                variant='secondary'
                size='sm'
                className='flex h-11 flex-col items-center rounded-sm py-1 hover:bg-transparent'>
                <ChevronUp className='h-5 w-5 stroke-2 text-foreground/60 transition-colors group-hover:text-foreground' />
                <div className='text-sm font-light text-foreground/60 transition-colors group-hover:text-foreground'>
                  {feedback.upvotes}
                </div>
              </Button>
              <span className='line-clamp-1 font-light text-foreground/95'>{feedback.title}</span>
            </div>
          </FeedbackModal>

          {/* Tags & User */}
          <div className='mr-2 flex flex-shrink-0 items-center gap-2'>
            {/* Tags */}
            {feedback.tags &&
              feedback.tags.length > 0 &&
              feedback.tags.map((tag) => (
                <div
                  className='group/tag hidden flex-shrink-0 flex-wrap items-center gap-2 rounded-full border px-3 py-1 transition-colors hover:cursor-pointer hover:border-foreground/20 hover:bg-accent/50 md:flex'
                  key={tag.name.toLowerCase()}
                  onClick={() => {
                    // If already selected, remove the tag
                    if (tag.name.toLowerCase() === searchParams.get('tags')) {
                      router.push(`${pathname}?${createQueryString('tags', '')}`);
                      return;
                    }

                    router.push(`${pathname}?${createQueryString('tags', tag.name)}`);
                  }}>
                  {/* Tag color */}
                  <div className='h-2 w-2 rounded-full' style={{ backgroundColor: tag.color }}></div>
                  {/* Tag name */}
                  <div className='text-xs font-light text-foreground/60 transition-colors group-hover/tag:text-foreground/80'>
                    {tag.name}
                  </div>
                </div>
              ))}

            {/* Status Icon */}
            {(() => {
              if (feedback.status) {
                const currentStatus =
                  statusOptions.find(
                    (option) => option.label.toLowerCase() === feedback.status?.toLowerCase()
                  ) || statusOptions[0];

                return (
                  <div
                    className='group/tag hidden flex-shrink-0 flex-wrap items-center gap-2 rounded-full border p-1 transition-colors hover:cursor-pointer hover:border-foreground/20 hover:bg-accent/50 md:flex'
                    onClick={() => {
                      // If already selected, remove the status
                      if (currentStatus.label.toLowerCase() === searchParams.get('status')) {
                        router.push(`${pathname}?${createQueryString('status', '')}`);
                        return;
                      }

                      router.push(`${pathname}?${createQueryString('status', currentStatus.label)}`);
                    }}>
                    <currentStatus.icon className='h-4 w-4 text-foreground/60' />
                  </div>
                );
              }
              return null;
            })()}

            {/* Date */}
            <div className='text-center text-xs font-extralight text-foreground/50'>
              {formatDate(new Date(feedback.created_at))}
            </div>

            {/* User */}
            <Avatar className='h-6 w-6 gap-2 border'>
              <AvatarImage src={feedback.user.avatar_url || ''} alt={feedback.user!.full_name} />
              <AvatarFallback>{feedback.user!.full_name}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      ))}
    </div>
  );
}
