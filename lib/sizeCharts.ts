/**
 * Brand size charts. Ranges are in inches and represent the body chest
 * measurement the brand says fits each size. Numbers are taken from each
 * brand's published men's tops size guide and rounded to the nearest 0.5".
 * For a real product you would extend per-category and per-region.
 */

export type Size = {
  label: string;
  chestMinIn: number;
  chestMaxIn: number;
};

export type Brand = {
  id: string;
  name: string;
  category: string;
  affiliateUrl: string;
  notes?: string;
  sizes: Size[];
};

export const BRANDS: Brand[] = [
  {
    id: "zara",
    name: "Zara",
    category: "Men · T-shirts",
    affiliateUrl: "https://www.zara.com/?aff=truesize",
    sizes: [
      { label: "XS", chestMinIn: 33.5, chestMaxIn: 35.5 },
      { label: "S", chestMinIn: 35.5, chestMaxIn: 37.5 },
      { label: "M", chestMinIn: 37.5, chestMaxIn: 39.5 },
      { label: "L", chestMinIn: 39.5, chestMaxIn: 42 },
      { label: "XL", chestMinIn: 42, chestMaxIn: 44 },
      { label: "XXL", chestMinIn: 44, chestMaxIn: 46.5 },
    ],
  },
  {
    id: "hm",
    name: "H&M",
    category: "Men · T-shirts",
    affiliateUrl: "https://www.hm.com/?aff=truesize",
    notes: "Runs roomy in the chest vs. Zara",
    sizes: [
      { label: "XS", chestMinIn: 34, chestMaxIn: 36 },
      { label: "S", chestMinIn: 36, chestMaxIn: 38 },
      { label: "M", chestMinIn: 38, chestMaxIn: 40 },
      { label: "L", chestMinIn: 40, chestMaxIn: 43 },
      { label: "XL", chestMinIn: 43, chestMaxIn: 46 },
      { label: "XXL", chestMinIn: 46, chestMaxIn: 49 },
    ],
  },
  {
    id: "uniqlo",
    name: "Uniqlo",
    category: "Men · T-shirts",
    affiliateUrl: "https://www.uniqlo.com/?aff=truesize",
    sizes: [
      { label: "XS", chestMinIn: 32, chestMaxIn: 34 },
      { label: "S", chestMinIn: 34, chestMaxIn: 36 },
      { label: "M", chestMinIn: 36, chestMaxIn: 38 },
      { label: "L", chestMinIn: 38, chestMaxIn: 41 },
      { label: "XL", chestMinIn: 41, chestMaxIn: 44 },
      { label: "XXL", chestMinIn: 44, chestMaxIn: 47 },
    ],
  },
  {
    id: "nike",
    name: "Nike",
    category: "Men · Tops",
    affiliateUrl: "https://www.nike.com/?aff=truesize",
    sizes: [
      { label: "XS", chestMinIn: 32, chestMaxIn: 34.5 },
      { label: "S", chestMinIn: 34.5, chestMaxIn: 37 },
      { label: "M", chestMinIn: 37, chestMaxIn: 40 },
      { label: "L", chestMinIn: 40, chestMaxIn: 43 },
      { label: "XL", chestMinIn: 43, chestMaxIn: 46.5 },
      { label: "XXL", chestMinIn: 46.5, chestMaxIn: 50 },
    ],
  },
  {
    id: "asos",
    name: "ASOS",
    category: "Men · T-shirts",
    affiliateUrl: "https://www.asos.com/?aff=truesize",
    sizes: [
      { label: "XS", chestMinIn: 33, chestMaxIn: 35 },
      { label: "S", chestMinIn: 35, chestMaxIn: 37 },
      { label: "M", chestMinIn: 37, chestMaxIn: 39 },
      { label: "L", chestMinIn: 39, chestMaxIn: 41 },
      { label: "XL", chestMinIn: 41, chestMaxIn: 44 },
      { label: "XXL", chestMinIn: 44, chestMaxIn: 47 },
    ],
  },
];

export type Recommendation = {
  brand: Brand;
  size: Size | null;
  fit: "perfect" | "between" | "below" | "above" | "unknown";
  message: string;
};

export function recommendForChest(chestIn: number): Recommendation[] {
  return BRANDS.map((brand) => {
    const inRange = brand.sizes.find(
      (s) => chestIn >= s.chestMinIn && chestIn < s.chestMaxIn,
    );
    if (inRange) {
      const slack = inRange.chestMaxIn - inRange.chestMinIn;
      const into = (chestIn - inRange.chestMinIn) / slack;
      const message =
        into < 0.25
          ? `${inRange.label} (loose fit)`
          : into > 0.75
            ? `${inRange.label} (snug — consider sizing up)`
            : `${inRange.label} (true to size)`;
      return {
        brand,
        size: inRange,
        fit: into < 0.25 ? "below" : into > 0.75 ? "above" : "perfect",
        message,
      } as Recommendation;
    }

    const smallest = brand.sizes[0];
    const largest = brand.sizes[brand.sizes.length - 1];
    if (chestIn < smallest.chestMinIn) {
      return {
        brand,
        size: smallest,
        fit: "below",
        message: `Below ${smallest.label} — try kids/teen sizes`,
      };
    }
    if (chestIn >= largest.chestMaxIn) {
      return {
        brand,
        size: largest,
        fit: "above",
        message: `Above ${largest.label} — try a tall/plus line`,
      };
    }
    return {
      brand,
      size: null,
      fit: "unknown",
      message: "No match",
    };
  });
}
