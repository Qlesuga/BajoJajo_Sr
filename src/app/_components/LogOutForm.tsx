import Link from "next/link";

const LogOutForm = () => {
  return (
    <div>
      <Link
        href={"/api/auth/signout"}
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      >
        Log Out
      </Link>
    </div>
  );
};

export default LogOutForm;
