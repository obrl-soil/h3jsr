context('H3 Algorithms')


# h3_to_parent
test_that(
  'h3_to_parent returns correctly',
  c(
    val1 <- h3_to_parent(h3_address = '8abe8d12acaffff', res = 6),
    val2 <- h3_to_parent(h3_address = '8abe8d12acaffff', res = 6,
                         simple = FALSE),
    expect_is(val1, 'character'),
    expect_equal(val1, '86be8d12fffffff'),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$h3_res, 'integer'),
    expect_is(val2$h3_parent, 'character'),
    expect_equal(val2$h3_parent, '86be8d12fffffff')
  )
)

# h3_to_children
test_that(
  'h3_to_children returns correctly',
  c(
    val1 <- h3_to_children(h3_address = '86be8d12fffffff', res = 8),
    val2 <- h3_to_children(h3_address = '86be8d12fffffff', res = 8,
                         simple = FALSE),
    expect_is(val1, 'list'),
    expect_equal(length(val1), 1L),
    expect_equal(length(val1[[1]]), 49L),
    expect_equal(val1[[1]][1], '88be8d1281fffff'),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$h3_res, 'integer'),
    expect_is(val2$h3_children, 'list'),
    expect_equal(length(val2$h3_children), 1),
    expect_equal(length(val2$h3_children[[1]]), 49L),
    expect_equal(val2$h3_children[[1]][1], '88be8d1281fffff')

  )
)

# h3_get_kring
test_that(
  'h3_get_kring returns correctly',
  c(
    val1 <- h3_get_kring(h3_address = '86be8d12fffffff', ring_size = 2),
    val2 <- h3_get_kring(h3_address = '86be8d12fffffff', ring_size = 2,
                           simple = FALSE),
    expect_is(val1, 'list'),
    expect_equal(length(val1), 1L),
    expect_equal(length(val1[[1]]), 19L),
    expect_equal(val1[[1]][1], '86be8d12fffffff'),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$ring_size, 'integer'),
    expect_is(val2$h3_kring, 'list'),
    expect_equal(length(val2$h3_kring), 1),
    expect_equal(length(val2$h3_kring[[1]]), 19L),
    expect_equal(val2$h3_kring[[1]][1], '86be8d12fffffff')

  )
)

# h3_get_kring_dist
test_that(
  'h3_get_kring_dist returns correctly',
  c(
    val1 <- h3_get_kring_list(h3_address = '86be8d12fffffff', ring_size = 2),
    val2 <- h3_get_kring_list(h3_address = '86be8d12fffffff', ring_size = 2,
                         simple = FALSE),
    expect_is(val1, 'list'),
    expect_equal(length(val1), 1L),
    expect_is(val1[[1]], 'list'),
    expect_equal(length(val1[[1]]), 3L),
    expect_equal(val1[[1]][[1]], '86be8d12fffffff'),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$ring_size, 'integer'),
    expect_is(val2$h3_kringd, 'list'),
    expect_equal(length(val2$h3_kringd), 1),
    expect_equal(length(val2$h3_kringd[[1]]), 3L),
    expect_equal(val2$h3_kringd[[1]][[1]], '86be8d12fffffff')

  )
)

# h3_get_ring
test_that(
  'h3_get_ring returns correctly',
  c(
    val1 <- h3_get_ring(h3_address = '86be8d12fffffff', ring_size = 2),
    val2 <- h3_get_ring(h3_address = '86be8d12fffffff', ring_size = 2,
                         simple = FALSE),
    expect_is(val1, 'list'),
    expect_equal(length(val1), 1L),
    expect_equal(length(val1[[1]]), 12L),
    expect_equal(val1[[1]][1], '86be8d8f7ffffff'),
    expect_is(val2, 'data.frame'),
    expect_is(val2$h3_address, 'character'),
    expect_is(val2$ring_size, 'integer'),
    expect_is(val2$h3_ring, 'list'),
    expect_equal(length(val2$h3_ring), 1),
    expect_equal(length(val2$h3_ring[[1]]), 12L),
    expect_equal(val2$h3_ring[[1]][1], '86be8d8f7ffffff')

  )
)

