import { useApp } from "../context/AppContext";
export default function useLoading() {
  const { loading, setLoading } = useApp();
  return { loading, setLoading };
}
