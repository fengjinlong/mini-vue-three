class User {
  constructor(opt) {
    this.name = opt.name;
    this.viewPage = opt.viewPage;
  }
  static getInstance(role) {
    switch (role) {
      case "superAdmin":
        return new User({
          name: "超级管理员",
          viewPage: ["首页", "应用数据", "权限管理"],
        });
        break;
      case "admin":
        return new User({
          name: "超级管理员",
          viewPage: ["首页", "应用数据"],
        });
        break;
      case "user":
        return new User({ name: "用户", viewPage: ["首页"] });
    }
  }
}
// 调用
// let superAdmin = User.getInstance("superAdmin");
// let admin = User.getInstance("admin");
// let user = User.getInstance("user");

function createPop(type, text) {
  const o = new Object();
  o.content = text;
  o.show = function () {
    console.log(this.content);
  };

  if (type === "alert") {
    o.ui = function () {
      console.log("element");
    };
  }
  if (type === "prompt") {
    o.ui = function () {
      console.log("iview");
    };
  }
  return o;
}

const userAlert = createPop("prompt", "i am");
userAlert.ui();
userAlert.show();

const Factory = function (type, content) {
  if (this instanceof Factory) {
    let s = new this[type](content);
  } else {
    return new Factory(type, content);
  }
};
Factory.prototype = {
  Java: function (content) {},
  JS: function (content) {},
  UI: function (content) {},
};
const data = [
  { type: "javascript", content: "javascript 哪家强" },
  { type: "java", content: "java 哪家强" },
  { type: "ui", content: "ui 哪家强" },
];
for (let i = 0; i < 3; i++) {
  Factory(data[i].type, data[i].content);
}
