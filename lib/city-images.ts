// City cover photos for the /events postcard cards — the fallback cover when an
// event has no image of its own. Free-for-commercial-use stock (Pexels / Unsplash /
// Pixabay), hotlinked CDN URLs: no attribution required, no next/image optimizer,
// no API key. Cities not listed here fall back to the category-gradient postcard.
// Sources + picks are recorded in the Obsidian note "Events City Fallback Images".
export const CITY_IMAGE: Record<string, string> = {
  "new-york": "https://images.pexels.com/photos/12327112/pexels-photo-12327112.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "dallas": "https://images.pexels.com/photos/13250722/pexels-photo-13250722.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "mexico-city": "https://images.unsplash.com/photo-1547686669-9a8cb1a22d91?w=1400&q=80",
  "seattle": "https://cdn.pixabay.com/photo/2015/06/16/21/57/seattle-811754_1280.jpg",
  "los-angeles": "https://images.pexels.com/photos/28738232/pexels-photo-28738232.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "chicago": "https://images.pexels.com/photos/26821665/pexels-photo-26821665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "scottsdale": "https://images.pexels.com/photos/32371655/pexels-photo-32371655.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "rio-de-janeiro": "https://images.pexels.com/photos/11051182/pexels-photo-11051182.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "london": "https://images.pexels.com/photos/11001427/pexels-photo-11001427.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "seoul": "https://images.pexels.com/photos/38043604/pexels-photo-38043604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "toronto": "https://images.pexels.com/photos/11819107/pexels-photo-11819107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "bangkok": "https://images.pexels.com/photos/19880901/pexels-photo-19880901.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "madrid": "https://images.pexels.com/photos/11807423/pexels-photo-11807423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "paris": "https://images.pexels.com/photos/17501700/pexels-photo-17501700.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "sydney": "https://images.pexels.com/photos/783681/pexels-photo-783681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "guadalajara": "https://images.pexels.com/photos/10040010/pexels-photo-10040010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "monterrey": "https://images.pexels.com/photos/18983477/pexels-photo-18983477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "buenos-aires": "https://images.pexels.com/photos/32983525/pexels-photo-32983525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "bogota": "https://images.pexels.com/photos/19675604/pexels-photo-19675604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "tampa": "https://images.pexels.com/photos/38724264/pexels-photo-38724264/free-photo-of-aerial-view-of-downtown-tampa-skyline-with-waterfront.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "boston": "https://images.pexels.com/photos/30740357/pexels-photo-30740357/free-photo-of-boston-skyline-at-dusk-with-high-rise-buildings.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "milan": "https://images.pexels.com/photos/15939547/pexels-photo-15939547/free-photo-of-cathedral-of-milan.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "melbourne": "https://images.pexels.com/photos/36891297/pexels-photo-36891297/free-photo-of-cityscape-of-melbourne-with-yarra-river.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "santiago": "https://images.pexels.com/photos/36143071/pexels-photo-36143071/free-photo-of-cityscape-with-snowy-andes-mountains-background.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "puebla": "https://images.pexels.com/photos/6942690/pexels-photo-6942690.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "tijuana": "https://images.pexels.com/photos/36341853/pexels-photo-36341853.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "chihuahua": "https://images.unsplash.com/photo-1707843672739-699f46517285?w=1400&q=80",
  "sao-paulo": "https://images.pexels.com/photos/29716901/pexels-photo-29716901.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "medellin": "https://images.pexels.com/photos/32427248/pexels-photo-32427248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "tokyo": "https://images.pexels.com/photos/31344755/pexels-photo-31344755.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "manila": "https://images.pexels.com/photos/17518170/pexels-photo-17518170.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "kuala-lumpur": "https://images.pexels.com/photos/38272709/pexels-photo-38272709.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "shanghai": "https://images.pexels.com/photos/38218977/pexels-photo-38218977.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "dubai": "https://images.pexels.com/photos/18341554/pexels-photo-18341554.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
};

export function cityImage(slug: string | null | undefined): string | undefined {
  return slug ? CITY_IMAGE[slug] : undefined;
}
