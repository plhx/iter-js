# iter-js

JavaScript で Rust-like なイテレータ操作を実現するライブラリ

```js
console.assert([1, 2, 3, 4, 5].iter().skip(2).eq([3, 4, 5].iter()), true)
```

## 注意事項

- グローバル空間に `Option` クラスが追加定義されます
  - `Option.some(x)` と `Option.none()` ファクトリでオプショナル値が表現できます
- グローバル空間に `Ordering` クラスが追加定義されます
  - `new Ordering(x)` または `Ordering.less`, `Ordering.equal`, `Ordering.greater` でインスタンスを生成できます
  - `Number.prototype.toOrdering()` で数値から `Ordering` に変換できます
- さらに次のオブジェクトのプロトタイプが上書きされます

|          | clone  | cmp | eq | iter | toString |
|----------|--------|-----|----|------|----------|
| Boolean  | ✅ | ✅ | ✅ |  |  |
| Number   | ✅ | ✅ | ✅ |  |  |
| BigInt   | ✅ | ✅ | ✅ |  |  |
| String   | ✅ | ✅ | ✅ | ✅ |  |
| Symbol   | ✅ | ✅ | ✅ | ✅ |  |
| Array    | ✅ | ✅ | ✅ | ✅ | ✅ |
| Set      | ✅ | ✅ | ✅ | ✅ |  |
| Map      | ✅ | ✅ | ✅ | ✅ |  |

## 制限事項

### 未実装のメソッド

- 以下のメソッドは実装していません
  - arrayChunks(): 未実装です
  - byRef(): 未実装です
  - collectInto(): 未実装です
  - copied(): 未実装です。cloned()を使用してください
  - inspect(): 未実装です
  - intersperceWith(): 未実装です
  - mapWindows(): 未実装です。map()を使用してください
  - nextChunk(): 未実装です
  - partialCmp(): 未実装です。cmp()を使用してください
  - partitionInPlace(): 未実装です。partition()を使用してください
  - peekable(): 未実装です
  - scan(): 未実装です
  - sizeHint(): 未実装です
  - tryCollect(): 未実装です
  - tryFind(): 未実装です
  - tryReduce(): 未実装です

### 逆イテレータ

- 以下のメソッドは、String, Arrayのイテレータ(DoubleEndedIterator)でのみ使用可能です
  - advanceBackBy()
  - nextBack()
  - nthBack()
  - rev()
  - rfind()
  - rfold()
  - rposition()

### 集約

- 以下のメソッドは、JavaScriptで配列要素と出力の型を特定できないため、空のイテレータに対しては失敗します
  - product(): `*` 演算子による集約を行います
  - sum(): `+` 演算子による集約を行います

### プライベート実装

- 以下のメソッドは、プライベート実装に限定されます
  - tryFold()
  - tryForEach()

### その他

- unzip(): 配列をタプルに見立てた分割代入に制限があります
