import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
    await requireAuth();
    
    return (
        <p>Workflow page</p>
    );
}

export default Page;