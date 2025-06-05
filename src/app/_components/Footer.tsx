import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-8 w-full border-t border-gray-300 py-4 text-center text-sm text-gray-600">
      <nav className="space-x-4">
        <Link href="/terms" className="hover:underline">
          Terms of Service
        </Link>
        <span>|</span>
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
      </nav>
      <p className="mt-2">
        By using this website, you agree to{" "}
        <Link href="/terms" className="underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
      <p className="mt-2">
        &copy; {new Date().getFullYear()} BajoJajoSr by Qłes
      </p>
    </footer>
  );
}
