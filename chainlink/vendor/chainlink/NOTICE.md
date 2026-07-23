# Vendored Chainlink VRF interfaces

These four files are the minimal dependency surface required by
`AegyoBtsGiveawayDraw.sol`. They are copied byte-for-byte, in their original
relative directory structure, from `@chainlink/contracts` version `1.5.0`
(MIT). The downloaded npm archive has integrity:

```text
sha512-1fGJwjvivqAxvVOTqZUEXGR54CATtg0vjcXgSIk4Cfoad2nUhSG/qaWHXjLg1CkNTeOoteoxGQcpP/HiA5HsUA==
```

Upstream package:
<https://www.npmjs.com/package/@chainlink/contracts/v/1.5.0>

Upstream paths:

- `src/v0.8/vrf/dev/VRFV2PlusWrapperConsumerBase.sol`
- `src/v0.8/vrf/dev/interfaces/IVRFV2PlusWrapper.sol`
- `src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol`
- `src/v0.8/shared/interfaces/LinkTokenInterface.sol`

Vendored-file SHA-256 checksums:

```text
8cf045f295b8c6035d14012a9bc2e8ab2b5ce24749a199ca0190519c4bf2dcc0  src/v0.8/vrf/dev/VRFV2PlusWrapperConsumerBase.sol
a48aaaeaed60e65f04f6c8772e5673dda663dcfa7913fdadd14b412300b9d5f1  src/v0.8/vrf/dev/interfaces/IVRFV2PlusWrapper.sol
f3b89bb466c2a79b10c1816d342fbfbec49fe82695cba92bd46e7d31af698011  src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol
f81ec96e909daa2cd27536274a30d916b26d5fc91261bed8d7a6a3e157f3825c  src/v0.8/shared/interfaces/LinkTokenInterface.sol
```

Only native direct funding is exercised by the Aegyo consumer. Vendoring keeps
the website's production dependency graph unchanged and makes contract builds
independent of npm lifecycle/tooling packages included in the full Chainlink
distribution.
