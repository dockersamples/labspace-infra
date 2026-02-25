# 📝 Variables

Labspaces provide the ability to create components that request input from users, which are stored as variables.

## Variable setting

This will create a card to be used for variable setting and set the **greeting** variable:

::variableDefinition[greeting]{prompt="What greeting would you like to have?"}

This will create a button that will set the value of **secondaryGreeting** specifically to "Whalecome to Docker"

::variableSetButton[Use Anthropic model]{variable="secondaryGreeting" value="Whalecome to Docker"}


## Variable display

The **greeting** variable currently has a value of: **$$greeting$$**

```bash
echo "$$greeting$$"
```



The **secondaryGreeting** variable currently has a value of: **$$secondaryGreeting$$**

```bash
echo "$$secondaryGreeting$$"
```