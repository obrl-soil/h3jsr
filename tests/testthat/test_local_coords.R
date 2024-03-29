context('local coordinates')

test_that('get_local_ij returns correctly', {
  expect_error(get_local_ij('whereami', 'whoami'))
  expect_error(get_local_ij('86be8d12fffffff'))
  expect_error(get_local_ij('86be8d12fffffff',
                            c('86be8d127ffffff', '86be8d107ffffff')))
  val1 <- get_local_ij('86be8d12fffffff', '86be8d127ffffff')
  val2 <- get_local_ij('86be8d12fffffff', '86be8d127ffffff', simple = FALSE)
  expect_is(val1, 'matrix')
  expect_equal(dim(val1), c(1, 2))
  expect_equal(names(val2), c('origin', 'destination', 'geometry'))
  expect_equal(val1[1], -87L) # note: probs unstable
  expect_equal(val1[2], 36L)  # note: probs unstable
  expect_is(val2$geometry, 'sfc_POINT')
  expect_true(is.na(sf::st_crs(val2)))
})

test_that('get_local_cell returns correctly', {
  expect_error(get_local_cell('whereami', -87L, 36L))
  expect_error(get_local_cell('86be8d12fffffff'))
  val1 <- get_local_cell('86be8d12fffffff', -87L, 36L)
  val2 <- get_local_cell('86be8d12fffffff', -87L, 36L, simple = FALSE)
  expect_is(val1, 'character')
  expect_is(val2, 'data.frame')
  expect_length(val1, 1L)
  expect_true(h3jsr::is_valid(val1))
  expect_equal(names(val2), c('origin', 'i', 'j', 'destination'))
  expect_equal(dim(val2)[1], 1)
  expect_equal(dim(val2)[2], 4)
  expect_equal(val2$destination, '86be8d127ffffff')
})
