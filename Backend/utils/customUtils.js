import { promises as dns } from 'dns';

const weekCustomSort = (arr, n) => {
  if (!arr.some((item) => item.groupKey == n)) {
    let closest = arr.filter((item) => Number(item.groupKey) <= n);
    n =
      closest.length > 0
        ? Math.max(...closest.map((item) => Number(item.groupKey)))
        : Math.max(...arr.map((item) => Number(item.groupKey)));
  }

  let part1 = arr
    .filter((item) => Number(item.groupKey) > n)
    .sort((a, b) => Number(a.groupKey) - Number(b.groupKey));
  let part2 = arr
    .filter((item) => Number(item.groupKey) < n)
    .sort((a, b) => Number(a.groupKey) - Number(b.groupKey));

  let lastItem = arr.find((item) => Number(item.groupKey) === n);
  return [...part1, ...part2, lastItem];
};

function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname;

    // Remove the 'www.' prefix if present
    return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  } catch (error) {
    return null;
  }
}

async function verifyDomain(url) {
  const domain = extractDomain(url);
  if(domain === null){
    return false;
  }
  try {
    const address = await dns.lookup(domain);
    return true;
  } catch (err) {
    return false;
  }
}

export { weekCustomSort, verifyDomain };
