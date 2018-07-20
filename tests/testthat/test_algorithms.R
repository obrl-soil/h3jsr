context('H3 Algorithms')


# h3_to_parent
test_that(
  'h3_to_parent returns correctly',
  c(
    expect_error(h3_to_parent(h3_address = 'whereami', res = 1)),
    expect_error(h3_to_parent(h3_address = '8abe8d12acaffff', res = 20)),
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
    expect_error(h3_to_children(h3_address = 'whereami', res = 12)),
    expect_error(h3_to_children(h3_address = '8abe8d12acaffff', res = 20)),
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
    expect_error(h3_get_kring(h3_address = 'whereami', ring_size = 2)),
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
    expect_error(h3_get_kring_list(h3_address = 'whereami', ring_size = 2)),
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
    expect_error(h3_get_ring(h3_address = 'whereami', ring_size = 2)),
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

# h3_polyfill
test_that(
  'h3_polyfill returns correctly',
  c(
    expect_error(h3_polyfill(geometry = 'a shape', res = 4)),
    nc <- sf::st_read(system.file("shape/nc.shp", package="sf")),
    expect_error(h3_polyfill(geometry = nc[1, ], res = 4)),
    nc1 <- sf::st_cast(nc[1,], 'POLYGON'),
    expect_error(h3_polyfill(geometry = nc1, res = 20)),
    expect_warning(h3_polyfill(geometry = nc1, res = 1)),
    val1 <- h3_polyfill(geometry = nc1, res = 4),
    val2 <- h3_polyfill(geometry = nc1, res = 4,
                        simple = FALSE),
    expect_is(val1, 'list'),
    expect_equal(length(val1), 1L),
    expect_equal(val1[[1]], '842a993ffffffff'),
    expect_is(val2, 'data.frame'),
    expect_is(val2, 'sf'),
    expect_is(val2$h3_polyfiller, 'list'),
    expect_is(val2$h3_polyfiller[[1]], 'character'),
    val3 <- h3_polyfill(geometry = nc1, res = 1),
    expect_equal(val3[[1]], NA_character_)
  )
)

# h3_set_to_multipolygon
test_that(
  'h3_set_to_multipolygon returns correctly',
  c(
    expect_error(h3_set_to_multipolygon(h3_addresses = 'whereami')),
    val <- geo_to_h3(lon = 153.023503, lat = -27.468920, res = 10),
    val <- h3_get_kring(h3_address = val, ring_size = 2),
    val1 <- h3_set_to_multipolygon(unlist(val)),
    val2 <- h3_set_to_multipolygon(unlist(val), simple = FALSE),
    expect_equal(val1, h3_set_to_multipolygon(val)),
    expect_is(val1, 'sfc'),
    expect_is(val2, 'sf'),
    expect_is(val2$h3_addresses, 'list'),
    expect_is(val2$h3_addresses[[1]], 'character')
    )
)


# h3_compact
test_that(
  'h3_compact returns correctly',
  c(
    nc <- sf::st_read(system.file("shape/nc.shp", package="sf"), quiet = TRUE),
    nc1 <- nc[1, ],
    nc1 <- sf::st_cast(nc1, 'POLYGON'),
    fillers <- h3_polyfill(geometry = nc1, res = 6),
    val1 <- h3_compact(fillers),
    val2 <- h3_compact(fillers, simple = FALSE),
    expect_is(val1, 'character'),
    expect_equal(length(val1), 15L),
    expect_is(val2, 'list'),
    expect_equal(length(val2), 2L),
    expect_equal(length(val2[[1]]), 33L),
    expect_is(val2[[1]], 'character'),
    expect_equal(length(val2[[2]]), 15L),
    expect_is(val2[[2]], 'character')
  )
)

# h3_uncompact
test_that(
  'h3_uncompact returns correctly',
  c(
    nc <- sf::st_read(system.file("shape/nc.shp", package="sf"), quiet = TRUE),
    nc1 <- nc[1, ],
    nc1 <- sf::st_cast(nc1, 'POLYGON'),
    fillers <- h3_polyfill(geometry = nc1, res = 6),
    comp <- h3_compact(fillers),
    val1 <- h3_uncompact(fillers, res = 7),
    val2 <- h3_uncompact(fillers, res = 7, simple = FALSE),
    expect_is(val1, 'character'),
    expect_equal(length(val1), 231L),
    expect_is(val2, 'list'),
    expect_equal(length(val2), 2L),
    expect_equal(length(val2[[1]]), 33L),
    expect_is(val2[[1]], 'character'),
    expect_equal(length(val2[[2]]), 231L),
    expect_is(val2[[2]], 'character')
  )
)
