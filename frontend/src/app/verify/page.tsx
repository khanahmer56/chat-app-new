import VerifyPage from "@/component/VerifyPage";
import React from "react";

const page = async ({ searchParams }: any) => {
  const email = searchParams.email;
  return (
    <div>
      <VerifyPage email={email} />
    </div>
  );
};

export default page;
