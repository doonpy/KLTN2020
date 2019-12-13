const REQUIRE_DEFINITIONS = [
    "-----",
    "Title",
    "Price",
    "Acreage",
    "Address",
    "Other"
];
const MULTI_LANGUAGE = ["tiêu đề, title", "giá, price, giá cả", "diện tích, acreage, square", "địa chỉ, address, địa chỉ tài sản"];
const IGNORE_TAGS = ["br", "hr"];

module.exports = {
    REQUIRE_DEFINITIONS: REQUIRE_DEFINITIONS,
    MULTI_LANGUAGE: MULTI_LANGUAGE,
    IGNORE_TAGS: IGNORE_TAGS
};
