context('unidirectional edges')

# h3_are_neighbours
test_that(
  'h3_are_neighbours returns correctly',
  c(
    expect_error(h3_are_neighbours('whereami', 'whoami')),
    expect_error(h3_are_neighbours('whereami')),
    expect_error(h3_are_neighbours('86be8d12fffffff',
                                   c('86be8d127ffffff', '86be8d107ffffff'))),
    val1 <- h3_are_neighbours('86be8d12fffffff', '86be8d127ffffff'),
    val2 <- h3_are_neighbours(c('86be8d12fffffff', '86be8d107ffffff'),
                              c('86be8d127ffffff', '86be8d10fffffff'),
                              simple = FALSE),
    expect_is(val1, 'logical'),
    expect_equal(val1, TRUE),
    expect_is(val2, 'data.frame'),
    expect_equal(names(val2), c('origin', 'destination', 'h3_neighbours')),
    expect_equal(nrow(val2), 2),
    expect_equal(val2$h3_neighbours, c(TRUE, TRUE))
  )
)

# h3_get_udgedge
test_that(
  'h3_get_udedge returns correctly',
  c(
    expect_error(h3_get_udedge('whereami', 'whoami')),
    expect_error(h3_get_udedge('whereami')),
    expect_error(h3_get_udedge('86be8d12fffffff',
                               c('86be8d127ffffff', '86be8d107ffffff'))),
    val1 <- h3_get_udedge('86be8d12fffffff', '86be8d127ffffff'),
    val2 <- h3_get_udedge(c('86be8d12fffffff', '86be8d107ffffff'),
                          c('86be8d127ffffff', '86be8d10fffffff'),
                          simple = FALSE),
    expect_is(val1, 'character'),
    expect_equal(val1, '166be8d12fffffff'),
    expect_is(val2, 'data.frame'),
    expect_equal(names(val2), c('origin', 'destination', 'h3_udedge')),
    expect_equal(nrow(val2), 2),
    expect_equal(val2$h3_udedge, c('166be8d12fffffff', '116be8d107ffffff'))
  )
)
