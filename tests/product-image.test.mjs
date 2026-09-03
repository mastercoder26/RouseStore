import assert from "node:assert/strict";
import test from "node:test";
import { getProductImage } from "../src/lib/product-image.ts";

const cases = [
  ["rs-blanket-07", "/images/hero.jpg", "rouse-blanket"],
  ["rs-pen-08", "/images/raider_notebook.jpg", "rouse-pens"],
  ["rs-coldbrew-09", "/images/raider_bottle.jpg", "rouse-coldbrew"],
  ["rs-protein-10", "/images/raider_bottle.jpg", "rouse-chocolate"],
];

for (const [id, image, asset] of cases) {
  test(`${id}: upgrades only its old demo image without mutating saved data`, () => {
    const product = Object.freeze({ id, image });
    const current = `/images/campaign/${asset}.webp`;
    assert.equal(getProductImage(product), current);
    assert.equal(product.image, image);
    assert.equal(getProductImage({ id, image: current }), current);
    assert.equal(getProductImage({ id, image: "https://example.test/custom.jpg" }), "https://example.test/custom.jpg");
    assert.equal(getProductImage({ id, image: "" }), "");
  });
}

test("other products retain their existing imagery", () => {
  assert.equal(getProductImage({ id: "rs-bottle-05", image: "/images/raider_bottle.jpg" }), "/images/raider_bottle.jpg");
  assert.equal(getProductImage({ id: "custom-id", image: "/images/hero.jpg" }), "/images/hero.jpg");
});
