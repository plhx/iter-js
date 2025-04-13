!(root => {
    const UnitTest = (_ => {
        let countAll = 0
        let countOk = 0

        function assert(condition, ...args) {
            if (condition) {
                console.info(`[Unit Test]: ${args.map(x => x.toString()).join(' ')} [OK]`)
                countOk++
            } else {
                console.warn(`[Unit Test]: ${args.map(x => x.toString()).join(' ')} [FAILED]`)
            }
            countAll++
        }

        function assertEq(a, b) {
            assert(a.eq(b), a, '==', b)
        }

        function assertNe(a, b) {
            assert(!a.eq(b), a, '!=', b)
        }

        function assertEx(f) {
            try {
                f()
                assert(false)
            } catch (e) {
                assert(true, e)
            }
        }

        function report() {
            console.log(`[Unit Test]: ALL = ${countAll}, OK = ${countOk}, FAILED = ${countAll - countOk}`)
        }

        return { assert, assertEq, assertNe, assertEx, report }
    })()

    // Option.isSome
    {
        UnitTest.assertEq(Option.some(10).isSome, true)
        UnitTest.assertEq(Option.none().isSome, false)
    }

    // Option.isNone
    {
        UnitTest.assertEq(Option.some(10).isNone, false)
        UnitTest.assertEq(Option.none().isNone, true)
    }

    // Option.and
    {
        UnitTest.assertEq(Option.some(10).and(20), 20)
        UnitTest.assertEq(Option.none().and(20), Option.none())
    }

    // Option.andThen
    {
        UnitTest.assertEq(Option.some(10).andThen(x => Option.some(x * 2)), Option.some(20))
        UnitTest.assertEq(Option.none().andThen(x => Option.some(x * 2)), Option.none())
    }

    // Option.eq
    {
        UnitTest.assertEq(Option.some(10), Option.some(10))
        UnitTest.assertNe(Option.some(10), Option.some(20))
        UnitTest.assertNe(Option.some(10), Option.none())
        UnitTest.assertEq(Option.none(), Option.none())
    }

    // Option.map
    {
        UnitTest.assertEq(Option.some(10).map(x => x * 2), Option.some(20))
        UnitTest.assertEq(Option.none().map(x => x * 2), Option.none())
    }

    // Option.or
    {
        UnitTest.assertEq(Option.some(10).or(Option.some(20)), Option.some(10))
        UnitTest.assertEq(Option.none().or(Option.some(20)), Option.some(20))
    }

    // Option.orElse
    {
        UnitTest.assertEq(Option.some(10).orElse(() => Option.some(20)), Option.some(10))
        UnitTest.assertEq(Option.none().orElse(() => Option.some(20)), Option.some(20))
    }

    // Option.take
    {
        let a = Option.some(10)
        UnitTest.assertEq(a.take(), Option.some(10))
        UnitTest.assertEq(a.take(), Option.none())

        let b = Option.none()
        UnitTest.assertEq(b.take(), Option.none())
        UnitTest.assertEq(b.take(), Option.none())
    }

    // Option.unwrap
    {
        UnitTest.assertEq(Option.some(10).unwrap(), 10)
        UnitTest.assertEx(() => Option.none().unwrap())
    }

    // Option.unwrapOr
    {
        UnitTest.assertEq(Option.some(10).unwrapOr(20), 10)
        UnitTest.assertEq(Option.none().unwrapOr(20), 20)
    }

    // Ordering.isLess
    {
        UnitTest.assertEq((-1).toOrdering().isLess, true)
        UnitTest.assertEq((0).toOrdering().isLess, false)
        UnitTest.assertEq((1).toOrdering().isLess, false)
    }

    // Ordering.isLessEqual
    {
        UnitTest.assertEq((-1).toOrdering().isLessEqual, true)
        UnitTest.assertEq((0).toOrdering().isLessEqual, true)
        UnitTest.assertEq((1).toOrdering().isLessEqual, false)
    }

    // Ordering.isEqual
    {
        UnitTest.assertEq((-1).toOrdering().isEqual, false)
        UnitTest.assertEq((0).toOrdering().isEqual, true)
        UnitTest.assertEq((1).toOrdering().isEqual, false)
    }

    // Ordering.isGreater
    {
        UnitTest.assertEq((-1).toOrdering().isGreater, false)
        UnitTest.assertEq((0).toOrdering().isGreater, false)
        UnitTest.assertEq((1).toOrdering().isGreater, true)
    }

    // Ordering.isGreaterEqual
    {
        UnitTest.assertEq((-1).toOrdering().isGreaterEqual, false)
        UnitTest.assertEq((0).toOrdering().isGreaterEqual, true)
        UnitTest.assertEq((1).toOrdering().isGreaterEqual, true)
    }

    // Ordering.eq
    {
        UnitTest.assertEq((-1).toOrdering(), Ordering.less)
        UnitTest.assertEq((0).toOrdering(), Ordering.equal)
        UnitTest.assertEq((1).toOrdering(), Ordering.greater)
    }

    // Ordering.toOrdering
    {
        UnitTest.assertEq(Ordering.less.toOrdering(), Ordering.less)
        UnitTest.assertEq(Ordering.equal.toOrdering(), Ordering.equal)
        UnitTest.assertEq(Ordering.greater.toOrdering(), Ordering.greater)
    }

    // Iterator.next
    {
        const a = [0, 1, 2]
        const iter = a.iter()
        UnitTest.assertEq(iter.next(), Option.some(0))
        UnitTest.assertEq(iter.next(), Option.some(1))
        UnitTest.assertEq(iter.next(), Option.some(2))
        UnitTest.assertEq(iter.next(), Option.none())
        UnitTest.assertEq(iter.next(), Option.none())
    }

    // Iterator.advanceBy
    {
        const a = [0, 1, 2, 3, 4, 5]
        const iter = a.iter()
        UnitTest.assertEq(iter.advanceBy(2), true)
        UnitTest.assertEq(iter.next(), Option.some(2))
        UnitTest.assertEq(iter.advanceBy(4), false)
    }

    // Iterator.all
    {
        const a = [0, 1, 2, 3, 4, 5]
        UnitTest.assertEq(a.iter().all(x => x >= 0), true)
        UnitTest.assertEq(a.iter().all(x => x < 0), false)
        UnitTest.assertEq(a.iter().all(x => x == 2), false)
    }

    // Iterator.any
    {
        const a = [0, 1, 2, 3, 4, 5]
        UnitTest.assertEq(a.iter().any(x => x >= 0), true)
        UnitTest.assertEq(a.iter().any(x => x < 0), false)
        UnitTest.assertEq(a.iter().any(x => x == 2), true)
    }

    // Iterator.chain
    {
        const a = [0, 1]
        const b = [100, 200]
        const iter = a.iter().chain(b.iter())
        UnitTest.assertEq(iter.next(), Option.some(0))
        UnitTest.assertEq(iter.next(), Option.some(1))
        UnitTest.assertEq(iter.next(), Option.some(100))
        UnitTest.assertEq(iter.next(), Option.some(200))
        UnitTest.assertEq(iter.next(), Option.none())
    }

    // Iterator.cloned
    {
        const a = new Set()
        const b = [a].iter().next().unwrap()
        const c = [a].iter().cloned().next().unwrap()
        c.add(10)
        UnitTest.assert(a == b, a, '==', b)
        UnitTest.assertEq(a.size, b.size)
        UnitTest.assert(a != c, a, '!=', c)
        UnitTest.assertNe(a.size, c.size)
    }

    // Iterator.cmp
    {
        UnitTest.assertEq([0, 1, 2].iter().cmp([0, 1, 2, 3].iter()), Ordering.less)
        UnitTest.assertEq([0, 1, 2].iter().cmp([0, 1, 3].iter()), Ordering.less)
        UnitTest.assertEq([].iter().cmp([0, 1, 3].iter()), Ordering.less)
        UnitTest.assertEq([0, 1, 2].iter().cmp([0, 1, 2].iter()), Ordering.equal)
        UnitTest.assertEq([].iter().cmp([].iter()), Ordering.equal)
        UnitTest.assertEq([0, 1, 2].iter().cmp([0, 1].iter()), Ordering.greater)
        UnitTest.assertEq([0, 1, 2].iter().cmp([0, 1, 1].iter()), Ordering.greater)
        UnitTest.assertEq([0, 1, 2].iter().cmp([].iter()), Ordering.greater)
    }

    // Iterator.cmpBy
    {
        UnitTest.assertEq([0, 1, 2].iter().cmpBy([0, 1, 3].iter(), (a, b) => a - b), Ordering.less)
        UnitTest.assertEq([0, 1, 2].iter().cmpBy([0, 1, -4].iter(), (a, b) => a - b), Ordering.greater)
        UnitTest.assertEq([0, 1, 2].iter().cmpBy([0, 1, -4].iter(), (a, b) => Math.abs(a) - Math.abs(b)), Ordering.less)
    }

    // Iterator.collect
    {
        UnitTest.assertEq([0, 1, 2].iter().collect(Array), [0, 1, 2])
        // TODO: UnitTest.assertEq(new Set([0, 1, 2]).iter().collect(Set), new Set([0, 1, 2]))
        // TODO: UnitTest.assertEq(new Map([['a', 10], ['b', 20]]).iter().collect(Map), new Map([['a', 10], ['b', 20]]))
    }

    // Iterator.count
    {
        UnitTest.assertEq([].iter().count(), 0)
        UnitTest.assertEq([0, 1, 2].iter().count(), 3)
        UnitTest.assertEq([0, 1, 2].iter().chain([3, 4].iter()).count(), 5)
        UnitTest.assertEq([0, 1, 2].iter().filter(x => x < 2).count(), 2)
        UnitTest.assertEq([0, 1, 2].iter().stepBy(2).count(), 2)
    }

    // Iterator.cycle
    {
        const iter = [0, 1, 2].iter().cycle()
        UnitTest.assertEq(iter.next(), Option.some(0))
        UnitTest.assertEq(iter.next(), Option.some(1))
        UnitTest.assertEq(iter.next(), Option.some(2))
        UnitTest.assertEq(iter.next(), Option.some(0))
        UnitTest.assertEq(iter.next(), Option.some(1))
        UnitTest.assertEq(iter.next(), Option.some(2))
        UnitTest.assertEq(iter.next(), Option.some(0))
    }

    // Iterator.enumerate
    {
        const iter = ['foo', 'bar', 'baz'].iter().enumerate()
        UnitTest.assertEq(iter.next(), Option.some([0, 'foo']))
        UnitTest.assertEq(iter.next(), Option.some([1, 'bar']))
        UnitTest.assertEq(iter.next(), Option.some([2, 'baz']))
        UnitTest.assertEq(iter.next(), Option.none())
    }

    // Iterator.eq
    {
        UnitTest.assertEq([].iter().eq([].iter()), true)
        UnitTest.assertEq([0, 1, 2].iter().eq([0, 1].iter()), false)
        UnitTest.assertEq([0, 1, 2].iter().eq([0, 1, 2].iter()), true)
    }

    // Iterator.eqBy
    {
        UnitTest.assertEq([].iter().eq([].iter(), (a, b) => a == b), true)
        UnitTest.assertEq([1, 2, 3].iter().eqBy([1, 2].iter(), (a, b) => a == b), false)
        UnitTest.assertEq([1, 2, 3].iter().eqBy([1, 2, 3].iter(), (a, b) => a == b), true)
        UnitTest.assertEq([1, 2, 3].iter().eqBy([-1, -2, -3].iter(), (a, b) => Math.abs(a) == Math.abs(b)), true)
    }

    // Iterator.filter
    {
        UnitTest.assertEq([0, 1, 2].iter().filter(x => x >= 0).collect(Array), [0, 1, 2])
        UnitTest.assertEq([1, -1, 2, -2].iter().filter(x => x >= 0).collect(Array), [1, 2])
    }

    // Iterator.filterMap
    {
        const iter = [0, 1, 2, 3].iter()
        UnitTest.assertEq(iter.filterMap(x => (x & 1) ? Option.some(x) : Option.none()).collect(Array), [1, 3])
    }

    // Iterator.find
    {
        const iter = [0, 1, 2, 3, 4, 5].iter()
        UnitTest.assertEq(iter.find(x => x % 2 == 0), Option.some(0))
        UnitTest.assertEq(iter.find(x => x % 2 == 0), Option.some(2))
        UnitTest.assertEq(iter.find(x => x % 2 == 0), Option.some(4))
        UnitTest.assertEq(iter.find(x => x % 2 == 0), Option.none())
    }

    // Iterator.findMap
    {
        const iter = [0, 1, 2, 3, 4, 5].iter()
        UnitTest.assertEq(iter.findMap(x => x % 2 == 0 ? Option.some(x + 1) : Option.none()), Option.some(1))
        UnitTest.assertEq(iter.findMap(x => x % 2 == 0 ? Option.some(x + 1) : Option.none()), Option.some(3))
        UnitTest.assertEq(iter.findMap(x => x % 2 == 0 ? Option.some(x + 1) : Option.none()), Option.some(5))
        UnitTest.assertEq(iter.findMap(x => x % 2 == 0 ? Option.some(x + 1) : Option.none()), Option.none())
    }

    // Iterator.flatten
    {
        UnitTest.assertEq([].iter().flatten().collect(Array), [])
        UnitTest.assertEq([[], []].iter().flatten().collect(Array), [])
        UnitTest.assertEq([[0, 1], [2, 3], [4, 5]].iter().flatten().collect(Array), [0, 1, 2, 3, 4, 5])
        UnitTest.assertEq([[[0, 1], [2, 3]], [[4, 5], [6, 7]]].iter().flatten().collect(Array), [[0, 1], [2, 3], [4, 5], [6, 7]])
    }

    // Iterator.fold
    {
        UnitTest.assertEq([].iter().fold(0, (a, x) => a + x), 0)
        UnitTest.assertEq([0, 1, 2, 3, 4].iter().fold(0, (a, x) => a + x), 10)
    }

    // Iterator.forEach
    {
        let a = 0
        let b = 0
        ![].iter().forEach(x => { a += x })
        ![0, 1, 2, 3, 4].iter().forEach(x => { b += x })
        UnitTest.assertEq(a, 0)
        UnitTest.assertEq(b, 10)
    }

    // Iterator.fuse
    {
        const a = [1, 2].iter().fuse()
        UnitTest.assertEq(a.next(), Option.some(1))
        UnitTest.assertEq(a.next(), Option.some(2))
        UnitTest.assertEq(a.next(), Option.none())
    }

    // Iterator.ge
    {
        UnitTest.assertEq([].iter().ge([].iter()), true)
        UnitTest.assertEq([0, 1, 1].iter().ge([0, 1, 2].iter()), false)
        UnitTest.assertEq([0, 1, 2].iter().ge([0, 1, 2].iter()), true)
        UnitTest.assertEq([0, 1, 2].iter().ge([0, 1, 3].iter()), false)
        UnitTest.assertEq([0, 1, 2].iter().ge([0, 1].iter()), true)
        UnitTest.assertEq([0, 1, 2].iter().ge([0, 1, 2, 3].iter()), false)
    }

    // Iterator.gt
    {
        UnitTest.assertEq([].iter().gt([].iter()), false)
        UnitTest.assertEq([0, 1, 1].iter().gt([0, 1, 2].iter()), false)
        UnitTest.assertEq([0, 1, 2].iter().gt([0, 1, 2].iter()), false)
        UnitTest.assertEq([0, 1, 2].iter().gt([0, 1, 3].iter()), false)
        UnitTest.assertEq([0, 1, 2].iter().gt([0, 1].iter()), true)
        UnitTest.assertEq([0, 1, 2].iter().gt([0, 1, 2, 3].iter()), false)
    }

    // Iterator.intersperse
    {
        const iter = [0, 1, 2].iter().intersperse(100)
        UnitTest.assertEq(iter.next(), Option.some(0))
        UnitTest.assertEq(iter.next(), Option.some(100))
        UnitTest.assertEq(iter.next(), Option.some(1))
        UnitTest.assertEq(iter.next(), Option.some(100))
        UnitTest.assertEq(iter.next(), Option.some(2))
        UnitTest.assertEq(iter.next(), Option.none())
    }

    // Iterator.isPartitioned
    {
        UnitTest.assertEq([1, 3, 5, 7, 9, 0, 2, 4, 6, 8].iter().isPartitioned(x => x % 2 != 0), true)
        UnitTest.assertEq([1, 3, 5, 7, 9, 0, 2, 4, 6, 8].iter().isPartitioned(x => x % 2 == 0), false)
    }

    // Iterator.isSorted
    {
        UnitTest.assertEq([].iter().isSorted(), true)
        UnitTest.assertEq([0, 1, 2].iter().isSorted(), true)
        UnitTest.assertEq([0, 1, 3].iter().isSorted(), true)
        UnitTest.assertEq([1, 0].iter().isSorted(), false)
    }

    // Iterator.isSortedBy
    {
        UnitTest.assertEq([].iter().isSortedBy((a, b) => a <= b), true)
        UnitTest.assertEq([0, 1, 2].iter().isSortedBy((a, b) => a <= b), true)
        UnitTest.assertEq([1, 0, 2].iter().isSortedBy((a, b) => a <= b), false)
        UnitTest.assertEq([0, -1, 2, -3].iter().isSortedBy((a, b) => Math.abs(a) <= Math.abs(b)), true)
    }

    // Iterator.isSortedByKey
    {
        UnitTest.assertEq([].iter().isSortedByKey(x => x), true)
        UnitTest.assertEq([0, 1, 2].iter().isSortedByKey(x => x), true)
        UnitTest.assertEq([1, 0, 2].iter().isSortedByKey(x => x), false)
        UnitTest.assertEq([0, -1, 2, -3].iter().isSortedByKey(x => Math.abs(x)), true)
    }

    // Iterator.last
    {
        UnitTest.assertEq([].iter().last(), Option.none())
        UnitTest.assertEq([1].iter().last(), Option.some(1))
    }

    // Iterator.le
    {
        UnitTest.assertEq([].iter().le([].iter()), true)
        UnitTest.assertEq([0, 1, 1].iter().le([0, 1, 2].iter()), true)
        UnitTest.assertEq([0, 1, 2].iter().le([0, 1, 2].iter()), true)
        UnitTest.assertEq([0, 1, 2].iter().le([0, 1, 3].iter()), true)
        UnitTest.assertEq([0, 1, 2].iter().le([0, 1].iter()), false)
        UnitTest.assertEq([0, 1, 2].iter().le([0, 1, 2, 3].iter()), true)
    }

    // Iterator.lt
    {
        UnitTest.assertEq([].iter().lt([].iter()), false)
        UnitTest.assertEq([0, 1, 1].iter().lt([0, 1, 2].iter()), true)
        UnitTest.assertEq([0, 1, 2].iter().lt([0, 1, 2].iter()), false)
        UnitTest.assertEq([0, 1, 2].iter().lt([0, 1, 3].iter()), true)
        UnitTest.assertEq([0, 1, 2].iter().lt([0, 1].iter()), false)
        UnitTest.assertEq([0, 1, 2].iter().lt([0, 1, 2, 3].iter()), true)
    }

    // Iterator.map
    {
        UnitTest.assertEq([].iter().map(x => x * 2).collect(Array), [])
        UnitTest.assertEq([1, 2, 3].iter().map(x => x * 2).collect(Array), [2, 4, 6])
    }

    // Iterator.mapWhile
    {
        UnitTest.assertEq([].iter().mapWhile(x => Option.some(x)).collect(Array), [])
        UnitTest.assertEq([1, 2, 3, 4, 5].iter().mapWhile(x => x < 0 ? Option.some(x) : Option.none()).collect(Array), [])
        UnitTest.assertEq([1, 2, 3, 4, 5].iter().mapWhile(x => x < 3 ? Option.some(x) : Option.none()).collect(Array), [1, 2])
    }

    // Iterator.max
    {
        UnitTest.assertEq([].iter().max(), Option.none())
        UnitTest.assertEq([1, -2, 7, -5, 0].iter().max(), Option.some(7))
    }

    // Iterator.maxBy
    {
        UnitTest.assertEq([].iter().maxBy((a, b) => a - b), Option.none())
        UnitTest.assertEq([1, -2, 7, -5, 0].iter().maxBy((a, b) => a - b), Option.some(7))
        UnitTest.assertEq([1, -2, 7, -5, 0].iter().maxBy((a, b) => b - a), Option.some(-5))
    }

    // Iterator.maxByKey
    {
        UnitTest.assertEq([].iter().maxByKey(x => Math.abs(x)), Option.none())
        UnitTest.assertEq([1, -2, 7, -5, 0].iter().maxByKey(x => Math.abs(x)), Option.some(7))
    }

    // Iterator.min
    {
        UnitTest.assertEq([].iter().min(), Option.none())
        UnitTest.assertEq([1, -2, 7, -5, 0].iter().min(), Option.some(-5))
    }

    // Iterator.minBy
    {
        UnitTest.assertEq([].iter().minBy((a, b) => a - b), Option.none())
        UnitTest.assertEq([1, -2, 7, -5, 0].iter().minBy((a, b) => a - b), Option.some(-5))
        UnitTest.assertEq([1, -2, 7, -5, 0].iter().minBy((a, b) => b - a), Option.some(7))
    }

    // Iterator.minByKey
    {
        UnitTest.assertEq([].iter().minByKey(x => Math.abs(x)), Option.none())
        UnitTest.assertEq([1, -2, 7, -5, 0].iter().minByKey(x => Math.abs(x)), Option.some(0))
    }

    // Iterator.ne
    {
        UnitTest.assertEq([].iter().ne([].iter()), false)
        UnitTest.assertEq([0, 1, 2].iter().ne([0, 1].iter()), true)
        UnitTest.assertEq([0, 1, 2].iter().ne([0, 1, 2].iter()), false)
    }

    // Iterator.nth
    {
        UnitTest.assertEq([].iter().nth(0), Option.none())

        const iter = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].iter()
        UnitTest.assertEq(iter.nth(7), Option.some(7))
        UnitTest.assertEq(iter.next(), Option.some(8))
        UnitTest.assertEq(iter.next(), Option.some(9))
        UnitTest.assertEq(iter.next(), Option.none())
    }

    // Iterator.partition
    {
        UnitTest.assertEq([].iter().partition(x => x % 2 == 0), [[], []])
        UnitTest.assertEq([1, 2, 3, 4].iter().partition(x => x % 2 == 0), [[2, 4], [1, 3]])
    }

    // Iterator.position
    {
        UnitTest.assertEq([].iter().position(x => x == 5), Option.none())
        UnitTest.assertEq([1, 2, 3, 4, 5, 6, 7, 8, 9].iter().position(x => x == 5), Option.some(4))
    }

    // Iterator.product
    {
        UnitTest.assertEx(() => [].iter().product())
        UnitTest.assertEq([1, 2, 3, 4, 5].iter().product(), 120)
    }

    // Iterator.reduce
    {
        UnitTest.assertEq([].iter().reduce((a, x) => a + x), Option.none())
        UnitTest.assertEq([1, 2, 3, 4, 5].iter().reduce((a, x) => a + x), Option.some(15))
    }

    // Iterator.skip
    {
        UnitTest.assertEq([].iter().skip(1).next(), Option.none())
        UnitTest.assertEq([1, 2, 3, 4].iter().skip(2).next(), Option.some(3))
    }

    // Iterator.skipWhile
    {
        UnitTest.assertEq([].iter().skipWhile(x => x < 3).next(), Option.none())
        UnitTest.assertEq([1, 2, 3, 4, 5, 6, 7].iter().skipWhile(x => x < 4).next(), Option.some(4))
    }

    // Iterator.stepBy
    {
        const iterA = [].iter().stepBy(2)
        UnitTest.assertEq(iterA.next(), Option.none())
        UnitTest.assertEq(iterA.next(), Option.none())
        const iterB = ['A', 'B', 'C', 'D', 'E'].iter().cycle().stepBy(2)
        UnitTest.assertEq(iterB.next(), Option.some('A'))
        UnitTest.assertEq(iterB.next(), Option.some('C'))
        UnitTest.assertEq(iterB.next(), Option.some('E'))
        UnitTest.assertEq(iterB.next(), Option.some('B'))
        UnitTest.assertEq(iterB.next(), Option.some('D'))
        UnitTest.assertEq(iterB.next(), Option.some('A'))
    }

    // Iterator.sum
    {
        UnitTest.assertEx(() => [].iter().sum())
        UnitTest.assertEq([1, 2, 3, 4, 5].iter().sum(), 15)
        UnitTest.assertEq(['Hello, ', 'world!'].iter().sum(), 'Hello, world!')
    }

    // Iterator.take
    {
        const iterA = [].iter().take(4)
        UnitTest.assertEq(iterA.next(), Option.none())
        UnitTest.assertEq(iterA.next(), Option.none())
        const iterB = [1, 2, 3, 4, 5, 6, 7, 8, 9].iter().skip(2).take(6).skip(2)
        UnitTest.assertEq(iterB.next(), Option.some(5))
        UnitTest.assertEq(iterB.next(), Option.some(6))
    }

    // Iterator.takeWhile
    {
        const iterA = [].iter().takeWhile(x => x < 8)
        UnitTest.assertEq(iterA.next(), Option.none())
        UnitTest.assertEq(iterA.next(), Option.none())
        const iterB = [1, 2, 3, 4, 5, 6, 7, 8, 9].iter().skip(2).takeWhile(x => x < 6).skip(2)
        UnitTest.assertEq(iterB.next(), Option.some(5))
        UnitTest.assertEq(iterB.next(), Option.none())
    }

    // Iterator.unzip
    {
        UnitTest.assertEq([].iter().unzip(), [[], []])
        UnitTest.assertEq([[1, 2], [3, 4]].iter().unzip(), [[1, 3], [2, 4]])
    }

    // Iterator.zip
    {
        const iterA = [1, 2, 3].iter().zip([4, 5, 6].iter())
        UnitTest.assertEq(iterA.next(), Option.some([1, 4]))
        UnitTest.assertEq(iterA.next(), Option.some([2, 5]))
        UnitTest.assertEq(iterA.next(), Option.some([3, 6]))
        UnitTest.assertEq(iterA.next(), Option.none())
        const iterB = [].iter().zip([].iter())
        UnitTest.assertEq(iterB.next(), Option.none())
    }

    // DoubleEndedIterator.nextBack
    {
        const iterA = [1, 2, 3].iter()
        UnitTest.assertEq(iterA.nextBack(), Option.some(3))
        UnitTest.assertEq(iterA.nextBack(), Option.some(2))
        UnitTest.assertEq(iterA.nextBack(), Option.some(1))
        UnitTest.assertEq(iterA.nextBack(), Option.none())
        const iterB = [1, 2, 3].iter()
        UnitTest.assertEq(iterB.nextBack(), Option.some(3))
        UnitTest.assertEq(iterB.next(), Option.some(1))
        UnitTest.assertEq(iterB.nextBack(), Option.some(2))
        UnitTest.assertEq(iterB.nextBack(), Option.none())
    }

    // DoubleEndedIterator.nthBack
    {
        UnitTest.assertEq([1, 2, 3, 4, 5].iter().nthBack(3), Option.some(2))
        UnitTest.assertEq([1, 2, 3, 4, 5].iter().nthBack(10), Option.none())
    }

    // DoubleEndedIterator.rev
    {
        UnitTest.assertEq([].iter().rev().next(), Option.none())
        UnitTest.assertEq([].iter().rev().nextBack(), Option.none())
        UnitTest.assertEq([1, 2, 3, 4, 5].iter().rev().next(), Option.some(5))
        UnitTest.assertEq([1, 2, 3, 4, 5].iter().rev().nextBack(), Option.some(1))
        UnitTest.assertEx(() => [1, 2, 3, 4, 5].iter().rev().rev())
    }

    // DoubleEndedIterator.rfind
    {
        UnitTest.assertEq([1, -2, 3, 4, 5].iter().rfind(x => x < 0), Option.some(-2))
        UnitTest.assertEq([1, -2, 3, 4, 5].iter().rfind(x => x == 0), Option.none())
    }

    // DoubleEndedIterator.rfold
    {
        UnitTest.assertEq([1, 2, 3, 4, 5].iter().rfold(0, (a, x) => a + x), 15)
        UnitTest.assertEq([1, 2, 3, 4, 5].iter().rfold(0, (_, x) => x), 1)
        UnitTest.assertEq([].iter().rfold(0, (a, x) => a + x), 0)
    }

    // DoubleEndedIterator.rposition
    {
        UnitTest.assertEq([1, 2, 3, 4, 5].iter().rposition(x => x == 4), Option.some(3))
        UnitTest.assertEq([1, 2, 3, 4, 5].iter().rposition(x => x == -1), Option.none())
    }

    UnitTest.report()
})(this)
