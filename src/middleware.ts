import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/report", "/citizen", "/wards", "/dashboard", "/issues", "/verify", "/map"];

export default clerkMiddleware((auth, req) => {
    const url = req.nextUrl.pathname;
    const { userId } = auth();

    // Redirect legacy /login to Clerk sign-in
    if (url.startsWith("/login")) {
        return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    // Protect civic routes — unauthenticated users go to sign-in
    if (!userId && PROTECTED_ROUTES.some(route => url.startsWith(route))) {
        return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    // Redirect authenticated Clerk users away from auth pages back to home
    if (userId && (url.startsWith("/auth/sign-in") || url.startsWith("/auth/sign-up"))) {
        return NextResponse.redirect(new URL("/", req.url));
    }
});

export const config = {
    matcher: [
        "/((?!.*\\..*|_next).*)",
        "/(api|trpc)(.*)",
        "/",
        "/login",
        "/auth/sign-in",
        "/auth/sign-up",
    ],
};
