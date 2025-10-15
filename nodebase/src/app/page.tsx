import { caller } from '@/trpc/server';

const Page = async () => {
  const users = await caller.getUsers();
  return (
    <div className="text-red-500 font-bold text-3xl">
     {JSON.stringify(users)}
    </div>
  );
};

export default Page;