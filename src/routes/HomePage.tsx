import { Title, Stack, Container, Button } from "@mantine/core";
import { useWallet } from "../providers/WalletProvider";
import { web3FromAddress } from "@polkadot/extension-dapp";
import { ApiPromise, WsProvider } from "@polkadot/api";

const HomePage = () => {
  const { selectedAccount } = useWallet();

  const onSubmit = async () => {
    if (!selectedAccount) {
      alert("No account selected, connect wallet first");
      throw Error("No account selected!");
    }

    const injector = await web3FromAddress(selectedAccount.address);

    const wsProvider = new WsProvider("wss://kusama-rpc.mangata.online");
    const api = await ApiPromise.create({ provider: wsProvider });

    const currencySelection = {
      V3: {
        parents: 1,
        interior: {
          X1: {
            AccountId32: {
              id: api
                .createType("AccountId32", selectedAccount.address)
                .toHex(),
            },
          },
        },
      },
    };

    const tx = api.tx.xTokens.transfer(
      "4",
      "1000000000",
      currencySelection,
      "Unlimited"
    );

    tx.signAndSend(
      selectedAccount.address,
      { signer: injector.signer },
      ({ status, txHash }) => {
        if (status.isFinalized) {
          console.log({
            text: `Transaction finalized at blockHash ${status.asFinalized}`,
            hash: txHash,
          });
        }
      }
    );
  };

  return (
    <Container>
      <Stack gap="xl">
        <Stack w="100%" maw={400} mx="auto" gap="lg">
          <Title order={3}>New SpellRouter transfer</Title>
          <Button onClick={onSubmit}>Send transfer</Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default HomePage;
