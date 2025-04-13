/**
 * iter.js
 *
 * MIT License
 *
 * Copyright (c) 2025 PlasticHeart
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

!(root => {
    class ControlFlow {
        constructor(value) {
            this.value = value
        }

        get isContinue() {
            return this instanceof Continue
        }

        get isBreak() {
            return this instanceof Break
        }

        continueValue() {
            return this.isContinue ? Option.some(this.value) : Option.none()
        }

        mapContinue(f) {
            return this.isContinue ? new Continue(f(this.value)) : this
        }

        breakValue() {
            return this.isBreak ? Option.some(this.value) : Option.none()
        }

        mapBreak(f) {
            return this.isBreak ? new Break(f(this.value)) : this
        }
    }

    class Continue extends ControlFlow {

    }

    class Break extends ControlFlow {

    }

    const _NONE = { clone() { return this } }

    class Option {
        constructor(some) {
            this.some = some ?? _NONE
        }

        static some(value) {
            return new Option(value)
        }

        static none() {
            return new Option()
        }

        get isSome() {
            return this.some != _NONE
        }

        get isNone() {
            return !this.isSome
        }

        and(opt) {
            return this.isSome ? opt : this
        }

        andThen(f) {
            return this.isSome ? f(this.unwrap()) : this
        }

        branch() {
            return this.isSome ? new Continue(this.unwrap()) : new Break(this)
        }

        clone() {
            return new Option(this.some.clone())
        }

        eq(other) {
            return this.isNone && other.isNone
                || this.isSome && other.isSome && this.unwrap().eq(other.unwrap())
        }

        map(f) {
            return this.isSome ? Option.some(f(this.unwrap())) : this
        }

        or(opt) {
            return this.isSome ? this : opt
        }

        orElse(f) {
            return this.isSome ? this : f()
        }

        take() {
            const value = this.clone()
            this.some = _NONE
            return value
        }

        toString() {
            return this.isSome ? `Some(${this.unwrap()})` : `None`
        }

        unwrap() {
            if (this.isNone) {
                throw new Error('unwrap() on a None value')
            }
            return this.some
        }

        unwrapOr(value) {
            return this.isSome ? this.some : value
        }
    }

    class Ordering extends Number {
        static get less() {
            return new Ordering(-1)
        }

        static get equal() {
            return new Ordering(0)
        }

        static get greater() {
            return new Ordering(1)
        }

        get isLess() {
            return this < 0
        }

        get isLessEqual() {
            return this.isLess || this.isEqual
        }

        get isEqual() {
            return this == 0
        }

        get isGreater() {
            return this > 0
        }

        get isGreaterEqual() {
            return this.isEqual || this.isGreater
        }

        eq(other) {
            return this.isLess && other.isLess
                || this.isEqual && other.isEqual
                || this.isGreater && other.isGreater
        }

        toOrdering() {
            return this
        }
    }

    const _COLLECT = (_ => {
        const converter = new root.Map()
        converter.set(Array, function () { return this.fold([], (a, x) => (a.push(x), a)) })
        converter.set(root.Map, function () { return this.fold(new root.Map(), (a, [k, v]) => (a.set(k, v), a)) })
        converter.set(Object, function () { return this.fold({}, (a, [k, v]) => (a[k] = v, a)) })
        converter.set(Set, function () { return this.fold(new Set(), (a, x) => (a.add(x), a)) })
        return converter
    })()

    function _AND_THEN_OR_CLEAR(opt, f) {
        if (opt.isNone) {
            return opt
        }
        const x = f(opt.unwrap())
        if (x.isNone) {
            opt.some = _NONE
        }
        return x
    }

    function _ITER_COMPARE(a, b, f) {
        const value = a._tryForEach(x => {
            const value = b.next()
            return value.isSome
                ? f(x, value.unwrap()).mapBreak(x => new Break(x))
                : new Break(new Continue(new Ordering(1)))
        })
        return value.isContinue
            ? new Continue(b.next().isSome ? new Ordering(-1) : new Ordering(0))
            : value.value
    }

    class Iterator {
        *[Symbol.iterator]() {
            while (true) {
                const value = this.next()
                if (value.isNone) {
                    break
                }
                yield value.unwrap()
            }
        }

        clone() {
            throw new Error('required method clone() is not implemented')
        }

        next() {
            throw new Error('required method next() is not implemented')
        }

        nextBack() {
            throw new Error('nextBack() is not supported for Iterator')
        }

        advanceBy(n) {
            for (let i = 0; i < n; i++) {
                if (this.next().isNone) {
                    return false
                }
            }
            return true
        }

        advanceBackBy(n) {
            throw new Error('advanceBackBy() is not supported for Iterator')
        }

        all(f) {
            return this._tryFold(null, (_, x) => !f(x) ? new Break(null) : new Continue(null)).isContinue
        }

        any(f) {
            return this._tryFold(null, (_, x) => !f(x) ? new Continue(null) : new Break(null)).isBreak
        }

        chain(other) {
            return new Chain(this, other)
        }

        cloned() {
            return new Cloned(this)
        }

        cmp(other) {
            return this.cmpBy(other, (a, b) => a.cmp(b))
        }

        cmpBy(other, cmp) {
            return _ITER_COMPARE(this, other, (a, b) => {
                const value = cmp(a, b).toOrdering()
                return value == 0 ? new Continue(null) : new Break(new Ordering(value))
            }).value
        }

        collect(type) {
            return _COLLECT.get(type).call(this)
        }

        count() {
            return this.fold(0, (a, _) => a + 1)
        }

        cycle() {
            return new Cycle(this)
        }

        enumerate() {
            return new Enumerate(this)
        }

        eq(other) {
            return this.eqBy(other, (a, b) => a.cmp(b).isEqual)
        }

        eqBy(other, eq) {
            const value = _ITER_COMPARE(this, other, (a, b) => eq(a, b) ? new Continue(null) : new Break(null))
            return value.isContinue ? value.value.isEqual : false
        }

        filter(predicate) {
            return new Filter(this, predicate)
        }

        filterMap(f) {
            return new FilterMap(this, f)
        }

        find(f) {
            return this._tryFold(null, (_, x) => !f(x) ? new Continue(null) : new Break(x)).breakValue()
        }

        findMap(f) {
            return this._tryFold(null, (_, x) => {
                const value = f(x)
                return value.isSome ? new Break(value.unwrap()) : new Continue(null)
            }).breakValue()
        }

        flatten() {
            return new Flatten(this)
        }

        fold(init, f) {
            let accum = init
            while (true) {
                const value = this.next()
                if (value.isNone) {
                    break
                }
                accum = f(accum, value.unwrap())
            }
            return accum
        }

        forEach(f) {
            return this.fold(null, (_, x) => f(x))
        }

        fuse() {
            return new Fuse(this)
        }

        ge(other) {
            return this.cmp(other).isGreaterEqual
        }

        gt(other) {
            return this.cmp(other).isGreater
        }

        intersperse(separator) {
            return new Intersperse(this, separator)
        }

        isPartitioned(predicate) {
            return this.all(predicate) || !this.any(predicate)
        }

        isSorted() {
            return this.isSortedBy((a, b) => a <= b)
        }

        isSortedBy(f) {
            const value = this.next()
            if (value.isNone) {
                return true
            }
            let last = value.unwrap()
            return this.all(x => !f(last, x) ? false : (last = x, true))
        }

        isSortedByKey(f) {
            return this.map(f).isSorted()
        }

        last() {
            return this.fold(Option.none(), (_, x) => Option.some(x))
        }

        le(other) {
            return this.cmp(other).isLessEqual
        }

        lt(other) {
            return this.cmp(other).isLess
        }

        map(f) {
            return new Map(this, f)
        }

        mapWhile(predicate) {
            return new MapWhile(this, predicate)
        }

        max() {
            return this.maxBy((a, b) => a.cmp(b))
        }

        maxBy(compare) {
            return this.reduce((a, b) => compare(a, b).toOrdering() < 0 ? b : a)
        }

        maxByKey(key) {
            return this.map(x => [key(x), x]).maxBy((a, b) => a[0].cmp(b[0])).map(x => x[1])
        }

        min() {
            return this.minBy((a, b) => a.cmp(b))
        }

        minBy(compare) {
            return this.reduce((a, b) => compare(a, b).toOrdering() < 0 ? a : b)
        }

        minByKey(key) {
            return this.map(x => [key(x), x]).minBy((a, b) => a[0].cmp(b[0])).map(x => x[1])
        }

        ne(other) {
            return !this.eq(other)
        }

        nth(n) {
            return this.advanceBy(n) ? this.next() : Option.none()
        }

        nthBack(n) {
            throw new Error('nthBack() is not supported for Iterator')
        }

        partition(f) {
            const left = []
            const right = []
            this.fold(null, (_, x) => (!f(x) ? right : left).push(x))
            return [left, right]
        }

        position(predicate) {
            let acc = 0
            return this._tryFold(null, (_, x) => {
                return predicate(x) ? new Break(acc) : (acc++, new Continue(null))
            }).breakValue()
        }

        product() {
            return this.reduce((a, x) => a * x).unwrap()
        }

        reduce(f) {
            return this.next().map(x => this.fold(x, f))
        }

        rev() {
            throw new Error('rev() is not supported for Iterator')
        }

        rfind(predicate) {
            throw new Error('rfind() is not supported for Iterator')
        }

        rfold(init, f) {
            throw new Error('rfold() is not supported for Iterator')
        }

        rposition() {
            throw new Error('rposition() is not supported for Iterator')
        }

        skip(n) {
            return new Skip(this, n)
        }

        skipWhile(predicate) {
            return new SkipWhile(this, predicate)
        }

        stepBy(step) {
            return new StepBy(this, step)
        }

        sum() {
            return this.reduce((a, x) => a + x).unwrap()
        }

        take(n) {
            return new Take(this, n)
        }

        takeWhile(predicate) {
            return new TakeWhile(this, predicate)
        }

        _tryFold(init, f) {
            let accum = init
            while (true) {
                const value = this.next()
                if (value.isNone) {
                    break
                }
                const result = f(accum, value.unwrap())
                if (result.isBreak) {
                    return result
                }
                accum = result.value
            }
            return new Continue(accum)
        }

        _tryForEach(f) {
            return this._tryFold(null, (_, x) => f(x))
        }

        unzip() {
            const left = []
            const right = []
            for (const [a, b] of this) {
                left.push(a)
                right.push(b)
            }
            return [left, right]
        }

        zip(other) {
            return new Zip(this, other)
        }
    }

    class DoubleEndedIterator extends Iterator {
        constructor(values, { index = 0, end = null } = {}) {
            super()
            this.values = values
            this.index = index
            this.end = end ?? values.length
        }

        get length() {
            return this.end - this.index
        }

        clone() {
            return new DoubleEndedIterator(this.values, { index: this.index, end: this.end })
        }

        next() {
            return this.index < this.end ? Option.some(this.values[this.index++]) : Option.none()
        }

        nextBack() {
            return this.index < this.end ? Option.some(this.values[--this.end]) : Option.none()
        }

        advanceBackBy(n) {
            for (let i = 0; i < n; i++) {
                if (this.nextBack().isNone) {
                    return false
                }
            }
            return true
        }

        nthBack(n) {
            return this.advanceBackBy(n) ? this.nextBack() : Option.none()
        }

        rev() {
            return new Rev(this)
        }

        rfind(predicate) {
            return this._tryRfold(null, (_, x) => !predicate(x) ? new Continue(null) : new Break(x)).breakValue()
        }

        rfold(init, f) {
            let accum = init
            while (true) {
                const value = this.nextBack()
                if (value.isNone) {
                    break
                }
                accum = f(accum, value.unwrap())
            }
            return accum
        }

        rposition(predicate) {
            return this._tryRfold(this.length, (i, x) => {
                return !predicate(x) ? new Continue(i - 1) : new Break(i - 1)
            }).breakValue()
        }

        _tryRfold(init, f) {
            let accum = init
            while (true) {
                const value = this.nextBack()
                if (value.isNone) {
                    break
                }
                const result = f(accum, value.unwrap())
                if (result.isBreak) {
                    return result
                }
                accum = result.value
            }
            return new Continue(accum)
        }
    }

    class SetIterator extends Iterator {
        constructor(obj, { index = 0, iter = null } = {}) {
            super()
            this.obj = obj
            this.index = index
            this.iter = iter
        }

        clone() {
            return new SetIterator(this.obj, { index: this.index, iter: null })
        }

        next() {
            if (this.iter == null) {
                this.iter = this.obj[Symbol.iterator]()
                for (let i = 0; i < this.index; i++) {
                    if (this.iter.next().done) {
                        break
                    }
                }
            }
            const next = this.iter.next()
            return next.done ? Option.none() : Option.some(next.value)
        }
    }

    class MapIterator extends Iterator {
        constructor(obj, { index = 0, iter = null } = {}) {
            super()
            this.obj = obj
            this.index = index
            this.iter = iter
        }

        clone() {
            return new MapIterator(this.obj, { index: this.index, iter: null })
        }

        next() {
            if (this.iter == null) {
                this.iter = this.obj[Symbol.iterator]()
                for (let i = 0; i < this.index; i++) {
                    if (this.iter.next().done) {
                        break
                    }
                }
            }
            const next = this.iter.next()
            return next.done ? Option.none() : Option.some(next.value)
        }
    }

    class Chain extends Iterator {
        constructor(iter, other) {
            super()
            this.a = iter
            this.b = other
        }

        clone() {
            return new Chain(this.a, this.b)
        }

        next() {
            return this.a.next().orElse(() => this.b.next())
        }
    }

    class Cloned extends Iterator {
        constructor(iter) {
            super()
            this.iter = iter
        }

        clone() {
            return new Cloned(this.iter.clone())
        }

        next() {
            return this.iter.next().clone()
        }
    }

    class Cycle extends Iterator {
        constructor(iter) {
            super()
            this.iter = iter
            this.orig = iter.clone()
        }

        clone() {
            return new Cycle(this.iter.clone())
        }

        next() {
            const value = this.iter.next()
            if (value.isSome) {
                return value
            }
            this.iter = this.orig.clone()
            return this.iter.next()
        }
    }

    class Enumerate extends Iterator {
        constructor(iter, { count = 0 } = {}) {
            super()
            this.iter = iter
            this.count = count
        }

        clone() {
            return new Enumerate(this.iter.clone(), { count: this.count })
        }

        next() {
            return this.iter.next().map(x => [this.count++, x])
        }
    }

    class Filter extends Iterator {
        constructor(iter, predicate) {
            super()
            this.iter = iter
            this.predicate = predicate
        }

        clone() {
            return new Filter(this.iter.clone(), this.predicate)
        }

        next() {
            return this.iter.find(this.predicate)
        }
    }

    class FilterMap extends Iterator {
        constructor(iter, f) {
            super()
            this.iter = iter
            this.f = f
        }

        clone() {
            return new FilterMap(this.iter.clone(), this.f)
        }

        next() {
            return this.iter.findMap(this.f)
        }
    }

    class Flatten extends Iterator {
        constructor(iter, { frontiter, backiter } = {}) {
            super()
            this.iter = iter.fuse()
            this.frontiter = frontiter ?? Option.none()
            this.backiter = backiter ?? Option.none()
        }

        clone() {
            return new Flatten(this.iter.clone(), {
                frontiter: this.frontiter.clone(),
                backiter: this.backiter.clone()
            })
        }

        next() {
            while (true) {
                const item = _AND_THEN_OR_CLEAR(this.frontiter, x => x.next())
                if (item.isSome) {
                    return item
                }
                const next = this.iter.next()
                if (next.isSome) {
                    this.frontiter = Option.some(next.unwrap().iter())
                } else {
                    return _AND_THEN_OR_CLEAR(this.backiter, x => x.next())
                }
            }
        }
    }

    class Fuse extends Iterator {
        constructor(iter) {
            super()
            this.iter = iter instanceof Option ? iter : Option.some(iter)
        }

        clone() {
            return new Fuse(this.iter.clone())
        }

        next() {
            const value = this.iter.andThen(x => x.next())
            if (value.isNone) {
                this.iter = Option.none()
            }
            return value
        }
    }

    class Intersperse extends Iterator {
        constructor(iter, separator, { started = false } = {}) {
            super()
            this.iter = iter.fuse()
            this.separator = separator
            this.started = started
            this.nextItem = Option.none()
        }

        clone() {
            return new Intersperse(this.iter.clone(), this.separator, {
                started: this.started,
                nextItem: this.nextItem.clone()
            })
        }

        next() {
            if (this.started) {
                const value = this.nextItem.take()
                if (value.isSome) {
                    return value
                }
                const nextItem = this.iter.next()
                if (nextItem.isSome) {
                    this.nextItem = nextItem
                    return Option.some(this.separator.clone())
                }
                return Option.none()
            }
            this.started = true
            return this.iter.next()
        }
    }

    class Map extends Iterator {
        constructor(iter, f) {
            super()
            this.iter = iter
            this.f = f
        }

        clone() {
            return new Map(this.iter.clone(), this.f)
        }

        next() {
            return this.iter.next().map(this.f)
        }
    }

    class MapWhile extends Iterator {
        constructor(iter, predicate) {
            super()
            this.iter = iter
            this.predicate = predicate
        }

        clone() {
            return new MapWhile(this.iter.clone(), this.predicate)
        }

        next() {
            return this.iter.next().andThen(x => this.predicate(x))
        }
    }

    class Rev extends Iterator {
        constructor(iter) {
            super()
            this.iter = iter
        }

        clone() {
            return new Rev(this.iter.clone())
        }

        next() {
            return this.iter.nextBack()
        }

        nextBack() {
            return this.iter.next()
        }

        advanceBy(n) {
            return this.iter.advanceBackBy(n)
        }

        advanceBackBy(n) {
            return this.iter.advanceBy(n)
        }

        find(predicate) {
            return this.iter.rfind(predicate)
        }

        fold(init, f) {
            return this.iter.rfold(init, f)
        }

        nth(n) {
            return this.iter.nthBack(n)
        }

        nthBack(n) {
            return this.iter.nth(n)
        }

        rfind(predicate) {
            return this.iter.find(predicate)
        }

        rfold(init, f) {
            return this.iter.fold(init, f)
        }

        _tryFold(init, f) {
            return this.iter._tryRfold(init, f)
        }

        _tryRfold(init, f) {
            return this.iter._tryFold(init, f)
        }
    }

    class Skip extends Iterator {
        constructor(iter, n) {
            super()
            this.iter = iter
            this.n = n
        }

        clone() {
            return new Skip(this.iter.clone(), this.n)
        }

        next() {
            if (this.n > 0) {
                const value = this.iter.nth(this.n)
                return (this.n = 0, value)
            }
            return this.iter.next()
        }
    }

    class SkipWhile extends Iterator {
        constructor(iter, predicate, { flag = false } = {}) {
            super()
            this.iter = iter
            this.predicate = predicate
            this.flag = flag
        }

        clone() {
            return new SkipWhile(this.iter.clone(), this.predicate, { flag: this.flag })
        }

        next() {
            return this.iter.find(x => this.flag || !this.predicate(x) ? (this.flag = true) : false)
        }
    }

    class StepBy extends Iterator {
        constructor(iter, step, { firstTake = true } = {}) {
            super()
            this.iter = iter
            this.step = step
            this.firstTake = firstTake
        }

        clone() {
            return new StepBy(this.iter.clone(), this.step, { firstTake: this.firstTake })
        }

        next() {
            const stepSize = this.firstTake ? 0 : Math.max(this.step - 1, 0)
            this.firstTake = false
            return this.iter.nth(stepSize)
        }
    }

    class Take extends Iterator {
        constructor(iter, n) {
            super()
            this.iter = iter
            this.n = n
        }

        clone() {
            return new Take(this.iter.clone(), this.n)
        }

        next() {
            return this.n != 0 ? (this.n--, this.iter.next()) : Option.none()
        }
    }

    class TakeWhile extends Iterator {
        constructor(iter, predicate, { flag = false } = {}) {
            super()
            this.iter = iter
            this.predicate = predicate
            this.flag = flag
        }

        clone() {
            return new TakeWhile(this.iter.clone(), this.predicate, { flag: this.flag })
        }

        next() {
            if (this.flag) {
                return Option.none()
            }
            return this.iter.next().andThen(x => this.predicate(x) ? Option.some(x) : (this.flag = true, Option.none()))
        }
    }

    class Zip extends Iterator {
        constructor(a, b) {
            super()
            this.a = a
            this.b = b
        }

        clone() {
            return new Zip(this.a.clone(), this.b.clone())
        }

        next() {
            const a = this.a.next()
            const b = this.b.next()
            return a.isSome && b.isSome ? Option.some([a.unwrap(), b.unwrap()]) : Option.none()
        }
    }

    Object.assign(Boolean.prototype, {
        clone() { return !!this },
        cmp(other) { return (this - other).toOrdering() },
        eq(other) { return this.cmp(other).isEqual }
    })

    Object.assign(Number.prototype, {
        clone() { return +this },
        cmp(other) { return (this - other).toOrdering() },
        eq(other) { return this.cmp(other).isEqual },
        toOrdering() { return new Ordering(this) }
    })

    Object.assign(BigInt.prototype, {
        clone() { return +this },
        cmp(other) { return (this - other).toOrdering() },
        eq(other) { return this.cmp(other).isEqual }
    })

    Object.assign(String.prototype, {
        clone() { return '' + this },
        cmp(other) { return (this.localeCompare(other)).toOrdering() },
        iter() { return new DoubleEndedIterator([...this]) },
        eq(other) { return this.cmp(other).isEqual }
    })

    Object.assign(Symbol.prototype, {
        clone() { return Symbol(this.description) },
        cmp(other) { return this.description.cmp(other.description) },
        iter() { return new DoubleEndedIterator([...this]) },
        eq(other) { return this.cmp(other).isEqual }
    })

    Object.assign(Array.prototype, {
        clone() { return this.map(x => x.clone()) },
        cmp(other) { return this.iter().cmp(other.iter()) },
        eq(other) { return this.cmp(other).isEqual },
        iter() { return new DoubleEndedIterator(this) },
        toString() { return `[${this.map(x => x.toString()).join(', ')}]` }
    })

    Object.assign(Set.prototype, {
        clone() { return new Set([...this].map(x => x.clone())) },
        cmp(other) { return this.iter().cmp(other.iter()) },
        eq(other) { return this.cmp(other).isEqual },
        iter() { return new SetIterator(this) }
    })

    Object.assign(root.Map.prototype, {
        clone() { return new Map([...this].map(x => x.clone())) },
        cmp(other) { return this.iter().cmp(other.iter()) },
        eq(other) { return this.cmp(other).isEqual },
        iter() { return new MapIterator(this) }
    })

    Object.assign(root, { Option, Ordering })
})(this)
