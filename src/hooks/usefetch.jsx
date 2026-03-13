import { useEffect, useState } from "react";

const useFetch = (url) => {
  const [data, setdata] = useState();
  const [error, seterror] = useState(null);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const fetchUserDetails = await fetch(url);
        if (fetchUserDetails.ok) {
          const FetchedData = await fetchUserDetails.json();
          setdata(FetchedData);
        } else if (fetchUserDetails.status === 404) {
          seterror("check internet and try again!");
        } else {
          seterror("check internet and try again!");
        }
      } catch (error) {
        const errorValue = error.message;
        console.log(errorValue);
        seterror("something went wrong!");
      }
      setloading(false);
    };
    fetcher();
  }, [url]);
  return { data, error, loading };
};

export default useFetch;
