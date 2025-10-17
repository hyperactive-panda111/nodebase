'use client';

import  { requireAuth } from "@/lib/auth-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LogoutButton } from "./logout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorflows.queryOptions());

  const create = useMutation(trpc.createWorkflow.mutationOptions(
    {
      onSuccess: () => {
        toast.success('Job queued');
      },
    }
  ));

  const testAi = useMutation(trpc.testAi.mutationOptions(
    {
      onSuccess: () => {
        toast.success('AI Job queued');
      },
    }
  ));

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-y-6">
      protected server component  
      <div>
        {JSON.stringify(data, null, 2)}
      </div>
      <Button disabled={testAi.isPending} onClick={() => testAi.mutate()}>
        Test AI
      </Button>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        create workflow
      </Button>
      <LogoutButton/>
    </div>
  );
};

export default Page;
