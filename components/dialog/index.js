"use strict";
var _baseComponent = _interopRequireDefault(require("../helpers/baseComponent")),
  _classNames3 = _interopRequireDefault(require("../helpers/classNames"));

function _interopRequireDefault(t) {
  return t && t.__esModule ? t : {
    default: t
  }
}

function _objectSpread(e) {
  for (var t = 1; t < arguments.length; t++)
    if (t % 2) {
      var n = null != arguments[t] ? arguments[t] : {},
        o = Object.keys(n);
      "function" == typeof Object.getOwnPropertySymbols && (o = o.concat(Object.getOwnPropertySymbols(n).filter(function(t) {
        return Object.getOwnPropertyDescriptor(n, t).enumerable
      }))), o.forEach(function(t) {
        _defineProperty(e, t, n[t])
      })
    } else Object.defineProperties(e, Object.getOwnPropertyDescriptors(arguments[t]));
  return e
}

function _defineProperty(t, e, n) {
  return e in t ? Object.defineProperty(t, e, {
    value: n,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : t[e] = n, t
}
var defaults = {
    prefixCls: "wux-dialog",
    title: "",
    content: "",
    buttons: [],
    verticalButtons: !1,
    resetOnClose: !1,
    closable: !1,
    mask: !0,
    maskClosable: !0,
    zIndex: 1e3
  },
  defaultOptions = {
    onCancel: function() {},
    cancelText: "取消",
    cancelType: "default",
    onConfirm: function() {},
    confirmText: "确定",
    confirmType: "primary"
  };
(0, _baseComponent.default)({
  useFunc: !0,
  data: defaults,
  computed: {
    classes: ["prefixCls, buttons, verticalButtons", function(n, t, e) {
      return {
        prompt: "".concat(n, "__prompt"),
        input: "".concat(n, "__input"),
        buttons: (0, _classNames3.default)("".concat(n, "__buttons"), _defineProperty({}, "".concat(n, "__buttons--").concat(e ? "vertical" : "horizontal"), !0)),
        button: t.map(function(t) {
          var e;
          return {
            wrap: (0, _classNames3.default)("".concat(n, "__button"), (_defineProperty(e = {}, "".concat(n, "__button--").concat(t.type || "default"), t.type || "default"), _defineProperty(e, "".concat(n, "__button--bold"), t.bold), _defineProperty(e, "".concat(n, "__button--disabled"), t.disabled), _defineProperty(e, "".concat(t.className), t.className), e)),
            hover: t.hoverClass && "default" !== t.hoverClass ? t.hoverClass : "".concat(n, "__button--hover")
          }
        })
      }
    }]
  },
  methods: {
    //自己定义的方法，禁止移动
    catchTouchDisabledMove: function() {
    },
    onClosed: function() {
      if (this.data.resetOnClose) {
        var t = _objectSpread({}, this.$$mergeOptionsToData(defaults), {
          prompt: null
        });
        this.$$setData(t)
      }
    },
    onClose: function() {
      this.hide()
    },
    hide: function(t) {
      this.$$setData({ in: !1
      }), "function" == typeof t && t.call(this)
    },
    show: function(t) {
      var e = 0 < arguments.length && void 0 !== t ? t : {},
        n = this.$$mergeOptionsAndBindMethods(Object.assign({}, defaults, e));
      return this.$$setData(_objectSpread({ in: !0
      }, n)), this.originalButtons = n.buttons, this.hide.bind(this)
    },
    runCallbacks: function(t, e) {
      var n = t.currentTarget.dataset.index,
        o = this.originalButtons[n];
      o.disabled || this.hide(function() {
        return "function" == typeof o[e] && o[e](t)
      })
    },
    buttonTapped: function(t) {
      this.runCallbacks(t, "onTap")
    },
    bindgetuserinfo: function(t) {
      this.runCallbacks(t, "onGetUserInfo")
    },
    bindcontact: function(t) {
      this.runCallbacks(t, "onContact")
    },
    bindgetphonenumber: function(t) {
      this.runCallbacks(t, "onGotPhoneNumber")
    },
    bindopensetting: function(t) {
      this.runCallbacks(t, "onOpenSetting")
    },
    onError: function(t) {
      this.runCallbacks(t, "onError")
    },
    bindinput: function(t) {
      this.$$setData({
        "prompt.response": t.detail.value
      })
    },
    open: function(t) {
      var e = 0 < arguments.length && void 0 !== t ? t : {};
      return this.show(e)
    },
    alert: function(t) {
      var e = 0 < arguments.length && void 0 !== t ? t : {};
      return this.open(Object.assign({
        buttons: [{
          text: e.confirmText || defaultOptions.confirmText,
          type: e.confirmType || defaultOptions.confirmType,
          onTap: function(t) {
            "function" == typeof e.onConfirm && e.onConfirm(t)
          }
        }]
      }, e))
    },
    confirm: function(t) {
      var e = 0 < arguments.length && void 0 !== t ? t : {};
      return this.open(Object.assign({
        buttons: [{
          text: e.cancelText || defaultOptions.cancelText,
          type: e.cancelType || defaultOptions.cancelType,
          onTap: function(t) {
            "function" == typeof e.onCancel && e.onCancel(t)
          }
        }, {
          text: e.confirmText || defaultOptions.confirmText,
          type: e.confirmType || defaultOptions.confirmType,
          onTap: function(t) {
            "function" == typeof e.onConfirm && e.onConfirm(t)
          }
        }]
      }, e))
    },
    prompt: function() {
      var e = this,
        n = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {},
        t = {
          fieldtype: n.fieldtype ? n.fieldtype : "text",
          password: !!n.password,
          response: n.defaultText ? n.defaultText : "",
          placeholder: n.placeholder ? n.placeholder : "",
          maxlength: n.maxlength ? parseInt(n.maxlength) : ""
        };
      return this.open(Object.assign({
        prompt: t,
        buttons: [{
          text: n.cancelText || defaultOptions.cancelText,
          type: n.cancelType || defaultOptions.cancelType,
          onTap: function(t) {
            "function" == typeof n.onCancel && n.onCancel(t)
          }
        }, {
          text: n.confirmText || defaultOptions.confirmText,
          type: n.confirmType || defaultOptions.confirmType,
          onTap: function(t) {
            "function" == typeof n.onConfirm && n.onConfirm(t, e.data.prompt.response)
          }
        }]
      }, n))
    }
  }
});