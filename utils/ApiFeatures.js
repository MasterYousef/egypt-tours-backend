const searchParams = (queryData,type)=>{

}
class ApiFeatures {
  constructor(mongo, query) {
    this.mongo = mongo;
    this.query = query;
  }

  searchfillter() {
    const query = { ...this.query};
    const skipWords = ["sort", "keyword", "faild", "limit", "page"];
    if (query.keyword) {
      query.$or = [
        { title: { $regex: query.keyword } },
        { description: { $regex: query.keyword } },
      ];
    }
    skipWords.map((e) => delete query[e]);
    let queryString = JSON.stringify(query).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (e) => `$${e}`
    );
    this.mongo = this.mongo.find(JSON.parse(queryString));
    return this;
  }

  resultSort() {
    const { query } = this;
    if (query.sort) {
      this.mongo = this.mongo.sort(query.sort);
    }
    return this;
  }

  selectFailds() {
    const { query } = this;
    if (query.faild) {
      const faild = query.faild.split(",").join(" ");
      this.mongo = this.mongo.select(faild);
    }
    return this;
  }

  paginate() {
    const { query } = this;
    if (query.limit) {
      this.mongo = this.mongo.limit(query.limit);
    }
    if (query.page) {
      this.mongo = this.mongo.skip(query.limit * (query.page - 1));
    }
    return this;
  }
}

module.exports = ApiFeatures;
