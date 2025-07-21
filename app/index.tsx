import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function index() {
    const router = useRouter();

    useEffect(() => {
       const timer = setTimeout(() => {
            router.replace("/(tabs)/splash");
        }, 0);

        return () => clearTimeout(timer);
    }, [router]);
}