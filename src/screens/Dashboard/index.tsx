import React, {useState, useEffect, useCallback} from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from 'styled-components';

import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, DataProps } from '../../components/TransactionCard';

import { 
  Container, 
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighligtCards,
  Transactions,
  Title,
  TransactionList,
  LogoutButton,
  LoadContainer
} from './styles';

export interface DataListProps extends DataProps {
  id: string;
}

interface hightlightAmountProps {
  amount: string;
}

interface HightlighDataProps {
  entries: hightlightAmountProps;
  expensives: hightlightAmountProps;
  total: hightlightAmountProps;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HightlighDataProps>({} as HightlighDataProps);

  const theme = useTheme();

  async function loadTransactions() {
    const dataKey = '@gofinances:transactions';
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];
    
    let entriesTotal = 0;
    let expensiveTotal= 0;

    const transactionsFormatted: DataListProps[] = transactions
      .map((item: DataListProps) => {
        if(item.type === 'positive') {
          entriesTotal += Number(item.amount);
        }else {
          expensiveTotal += Number(item.amount);
        }

        const amount = Number(item.amount)
        .toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });

        
        const date = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }).format(new Date(item.date));

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date,
        }
      });

      setTransactions(transactionsFormatted);

      const total = entriesTotal - expensiveTotal;

      setHighlightData({
        entries: {
          amount: entriesTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
        },
        expensives: {
          amount: expensiveTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
        },

        total: {
          amount: total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
        }
      });

    setIsLoading(false);
  } 

  useEffect(() => {
    loadTransactions();


    // PARA LIMPAR A LISTA
    // const dataKey = '@gofinances:transactions';
    // AsyncStorage.removeItem(dataKey);
  },[]);

  useFocusEffect(useCallback(() => {
    loadTransactions();
  },[]));

  return (
    <Container>
      
      {
        isLoading ? 
          <LoadContainer>
            <ActivityIndicator 
              color={theme.colors.primary}
              size="large"
            />
          </LoadContainer> : 
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo 
                  source={{ uri: 'https://avatars.githubusercontent.com/u/59484932?v=4' }} 
                />

                <User>
                  <UserGreeting>Olá,</UserGreeting>
                  <UserName>Marcos Paulo</UserName>
                </User>
              </UserInfo>
              
              <LogoutButton onPress={() => {}}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighligtCards>
            <HighlightCard
              type="up"
              title="Entrada"
              amount={highlightData.entries.amount}
              lastTransaction="Última entrada dia 13 de abril"
            />

            <HighlightCard
              type="down"
              title="Saída"
              amount={highlightData.expensives.amount}
              lastTransaction="Última saída dia 03 de abril"
            />

            <HighlightCard
              type="total"
              title="Total"
              amount={highlightData.total.amount}
              lastTransaction="01 à 13 de abril"
            />
          </HighligtCards>
        
          <Transactions>
            <Title>Listagem</Title>

            <TransactionList 
              data={transactions}
              keyExtractor={item => item.id}
              renderItem={({item}) => <TransactionCard data={item}/>}
              
            />
          </Transactions>
        </>
      }
    </Container>
  );
}
